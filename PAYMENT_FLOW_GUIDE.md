# Panduan Implementasi: Direct Guest Checkout & Resume Pending Payment

Panduan ini berisi konsep arsitektur, langkah-langkah implementasi, dan contoh kode untuk mereplikasi fitur:
1. **Direct Guest Checkout (In-Flow Auth & Direct Payment)**: Pengguna yang belum login mengisi formulir data diri, lalu langsung diproses registrasi/login dan langsung diarahkan ke halaman pembayaran (*payment gateway*) tanpa perlu *reload* halaman atau klik tombol bayar dua kali.
2. **Resume Pending Payment (Lanjutkan Pembayaran)**: Jika pengguna menutup *popup* / lupa menyalin nomor Virtual Account, mereka dapat membuka kembali URL transaksi aktif (*pending*) tanpa harus *checkout* ulang.
3. **Cancel Pending Payment (Batalkan Pesanan)**: Memungkinkan pengguna membatalkan transaksi yang masih *pending* untuk membuat pesanan baru dengan voucher/metode lain.
4. **Smart Routing Riwayat Transaksi**: Mencegah *error* 404 ketika pengguna mengklik produk yang belum berstatus `paid`.

---

## 1. Arsitektur & Alur Kerja (Flowchart)

```
[ Pengguna Tamu / Guest ]
        │
        ▼ (Mengisi Form & Klik "Bayar Sekarang")
┌─────────────────────────────────────────────────────────────┐
│ Frontend: handleCheckout()                                 │
│ 1. Validasi form input                                      │
│ 2. POST /auto-login (jika email terdaftar) / POST /register │
│    ↳ Berjalan via Axios (session & CSRF cookie otomatis)    │
│ 3. Tanpa reload halaman, langsung panggil submitPayment()   │
│ 4. POST /invoice (Route Invoice Store)                      │
│ 5. Terima response { success: true, payment_url: '...' }    │
│ 6. window.location.href = payment_url                       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ (Diarahkan ke Midtrans / Payment Gateway)
[ Halaman Pembayaran Payment Gateway ]
        │
        ├─► [User Selesaikan Bayar] ──► Webhook update status 'paid' ──► Akses Kelas Terbuka
        │
        └─► [User Menutup Halaman Sebelum Bayar (Status Pending)]
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Halaman Register / Checkout (Ketika User Kembali)           │
│ - Menampilkan Card Pending Invoice                          │
│ - Tombol "Lanjutkan Pembayaran" ──► Buka invoice_url        │
│ - Tombol "Batalkan Pesanan"     ──► POST /invoice/{id}/cancel│
│ - Tombol "Cek Status"           ──► Reload halaman          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Implementasi Backend (Laravel)

### A. Database Migration
Pastikan tabel `invoices` memiliki kolom untuk menyimpan URL pembayaran dari Payment Gateway:

```php
Schema::table('invoices', function (Blueprint $table) {
    $table->text('invoice_url')->nullable()->after('status');
    $table->timestamp('expires_at')->nullable()->after('paid_at');
});
```

---

### B. Menyimpan `invoice_url` pada Controller Pembayaran (`InvoiceController.php`)

Ketika membuat transaksi ke payment gateway (misal Midtrans Snap), simpan `redirect_url` ke kolom `invoice_url`:

```php
public function store(Request $request)
{
    $userId = Auth::id();

    // 1. Buat record Invoice baru
    $invoice = Invoice::create([
        'user_id' => $userId,
        'invoice_code' => InvoiceHelper::generateCode(),
        'amount' => $totalAmount,
        'status' => 'pending',
        'expires_at' => Carbon::now()->addHours(24),
    ]);

    // 2. Request ke Payment Gateway (Midtrans Snap / Xendit / Tripay)
    $paymentResponse = $this->paymentGatewayService->createTransaction([
        'transaction_details' => [
            'order_id' => $invoice->invoice_code,
            'gross_amount' => $invoice->amount,
        ],
        // ... data customer & items
    ]);

    // 3. Simpan URL redirect / payment URL ke database
    $invoice->update([
        'invoice_url' => $paymentResponse['redirect_url'] ?? null,
    ]);

    // 4. Kembalikan response JSON
    return response()->json([
        'success' => true,
        'invoice_id' => $invoice->id,
        'invoice_code' => $invoice->invoice_code,
        'payment_url' => $paymentResponse['redirect_url'] ?? null,
    ]);
}
```

---

### C. Mengirimkan `invoice_url` pada Objek `pendingInvoice` ke Frontend

Pada controller yang merender halaman pendaftaran/checkout (misal `BootcampController`, `CourseController`, `WebinarController`), kirimkan `invoice_url`:

```php
public function showRegister($slug)
{
    $product = Product::where('slug', $slug)->firstOrFail();
    $pendingInvoice = null;

    if (Auth::check()) {
        $invoice = Invoice::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->whereHas('productItems', function ($q) use ($product) {
                $q->where('product_id', $product->id);
            })
            ->latest()
            ->first();

        if ($invoice) {
            $pendingInvoice = [
                'id' => $invoice->id,
                'invoice_code' => $invoice->invoice_code,
                'status' => $invoice->status,
                'amount' => $invoice->amount,
                'payment_method' => $invoice->payment_method,
                'invoice_url' => $invoice->invoice_url, // <-- Kirimkan ini
                'created_at' => $invoice->created_at->toISOString(),
                'expires_at' => $invoice->expires_at ? $invoice->expires_at->toISOString() : null,
            ];
        }
    }

    return Inertia::render('user/product/register', [
        'product' => $product,
        'pendingInvoice' => $pendingInvoice,
    ]);
}
```

---

### D. Endpoint Pembatalan Invoice (`InvoiceController@cancel`)

```php
public function cancel($id)
{
    $invoice = Invoice::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    if ($invoice->status === 'pending') {
        $invoice->update(['status' => 'cancelled']);
        
        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibatalkan.'
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Transaksi tidak dapat dibatalkan.'
    ], 400);
}
```

---

## 3. Implementasi Frontend (React + TypeScript + Inertia.js)

### A. TypeScript Interface untuk `PendingInvoice`

```typescript
interface PendingInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    payment_method?: string;
    invoice_url?: string | null;
    created_at: string;
    expires_at: string;
}
```

---

### B. Fungsi `submitPayment` (Menggunakan Axios)

Gunakan `axios.post` agar session cookie dan token CSRF otomatis terbawa:

```typescript
const submitPayment = async (overrideDiscountData?: any): Promise<void> => {
    const invoiceData = {
        type: 'bootcamp',
        id: product.id,
        discount_amount: discountAmount,
        total_amount: totalPrice,
    };

    try {
        const res = await axios.post(route('invoice.store'), invoiceData);

        if (res.data && res.data.success) {
            if (res.data.payment_url) {
                // Langsung arahkan ke URL Midtrans
                window.location.href = res.data.payment_url;
            } else {
                throw new Error('Payment URL tidak diterima dari server.');
            }
        } else {
            throw new Error(res.data?.message || 'Gagal membuat invoice.');
        }
    } catch (error) {
        console.error('Payment error:', error);
        throw error;
    }
};
```

---

### C. Fungsi `handleCheckout` (Guest Flow Tanpa Reload)

```typescript
const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Jika pengguna sudah login, langsung submit pembayaran
    if (auth.user) {
        setLoading(true);
        try {
            await submitPayment();
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses pembayaran.');
            setLoading(false);
        }
        return;
    }

    // 2. Jika pengguna belum login (Guest), lakukan validasi form data diri
    if (!guestData.name || !guestData.email || !guestData.phone) {
        toast.error('Mohon lengkapi seluruh data diri.');
        return;
    }

    setLoading(true);

    try {
        // A. Cek apakah email sudah terdaftar
        const checkRes = await axios.post('/check-email', { email: guestData.email });
        
        if (checkRes.data.exists) {
            // Login otomatis via passwordless / auto-login endpoint
            await axios.post('/auto-login', { email: guestData.email });
        } else {
            // Registrasi akun baru
            await axios.post('/register', {
                name: guestData.name,
                email: guestData.email,
                phone: guestData.phone,
                password: guestData.password,
            });
        }

        // B. Langsung jalankan submitPayment() tanpa reload halaman!
        await submitPayment();
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal memproses pendaftaran.');
        setLoading(false);
    }
};
```

---

### D. Komponen UI Card Pending Invoice (Lanjutkan Pembayaran & Batalkan)

```tsx
{pendingInvoice ? (
    <div className="rounded-2xl border bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Transaksi Menunggu Pembayaran
        </h3>
        <p className="text-sm text-gray-500">
            Kode Invoice: <span className="font-semibold">{pendingInvoice.invoice_code}</span>
        </p>
        <p className="text-xl font-bold text-orange-600 my-3">
            Rp {pendingInvoice.amount.toLocaleString('id-ID')}
        </p>

        <div className="space-y-2 pt-2">
            {/* Tombol Lanjutkan Pembayaran (Jika belum expired dan memiliki URL) */}
            {pendingInvoice.invoice_url && formatExpiryTime(pendingInvoice.expires_at).status !== 'expired' && (
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" size="lg">
                    <a href={pendingInvoice.invoice_url}>
                        Lanjutkan Pembayaran
                    </a>
                </Button>
            )}

            <div className="flex gap-2">
                {/* Tombol Cek Status */}
                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                    Cek Status
                </Button>

                {/* Tombol Batalkan Pesanan */}
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    size="lg"
                    disabled={cancellingInvoice}
                    onClick={async () => {
                        if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini dan membuat pesanan baru?')) {
                            setCancellingInvoice(true);
                            try {
                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                toast.success('Pesanan berhasil dibatalkan.');
                                window.location.reload();
                            } catch (err: any) {
                                toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan.');
                                setCancellingInvoice(false);
                            }
                        }
                    }}
                >
                    {cancellingInvoice ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </Button>
            </div>
        </div>
    </div>
) : (
    <form onSubmit={handleCheckout}>
        {/* Form Checkout & Data Diri */}
    </form>
)}
```

---

## 4. Smart Routing Riwayat Transaksi (Mencegah 404)

Pada halaman daftar riwayat transaksi (`/profile/transactions`), link pada judul transaksi harus membedakan status transaksi:

```typescript
const getItemHref = (type: string, slug: string, status: 'paid' | 'pending' | 'failed' | 'expired' | 'completed') => {
    if (!slug) return '#';

    // 1. Jika sudah dibayar: Arahkan ke ruang belajar / LMS profil
    if (status === 'paid' || status === 'completed') {
        if (type === 'Course') return route('profile.course.detail', { course: slug });
        if (type === 'Bootcamp') return route('profile.bootcamp.detail', { bootcamp: slug });
        if (type === 'Webinar') return route('profile.webinar.detail', { webinar: slug });
    }

    // 2. Jika belum dibayar (pending, failed, expired): Arahkan ke halaman detail publik produk
    if (type === 'Course') return route('course.detail', { course: slug });
    if (type === 'Bootcamp') return route('bootcamp.detail', { bootcamp: slug });
    if (type === 'Webinar') return route('webinar.detail', { webinar: slug });

    return '#';
};
```

---

## 5. Checklist Validasi & Best Practices

| No | Poin Pemeriksaan | Keterangan |
|---|---|---|
| 1 | **CSRF Cookie Handling** | Pastikan menggunakan library HTTP yang otomatis menangani cookie (`axios`) daripada `fetch` mentah agar rotasi token CSRF setelah registrasi/login tidak menimbulkan error `419 Page Expired`. |
| 2 | **Eager Loading** | Pastikan relasi model invoice (`courseItems.course`, `bootcampItems.bootcamp`, `bundleEnrollments.bundle`) dimuat lengkap di controller agar tidak terjadi *null pointer exception* di frontend. |
| 3 | **Cek Masa Berlaku Invoice** | Periksa `formatExpiryTime(expires_at).status !== 'expired'` sebelum menampilkan tombol *Lanjutkan Pembayaran*. |
| 4 | **Konfirmasi Pembatalan** | Berikan dialog konfirmasi sebelum memanggil endpoint `/invoice/{id}/cancel` untuk mencegah pembatalan tidak disengaja. |
