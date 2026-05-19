import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Schedule {
    id: string;
    title?: string | null;
    schedule_date?: string;
    start_date?: string;
    day?: string;
    start_time?: string;
    end_time?: string;
}

interface CertificationProgram {
    schedules: Schedule[];
    socializationSchedules?: Schedule[];
    type: 'regular' | 'scholarship';
}

export default function ScheduleInfoSection({ program }: { program: CertificationProgram }) {
    const schedules = program.schedules ?? [];
    const socializationSchedules =
        program.socializationSchedules ?? (program as CertificationProgram & { socialization_schedules?: Schedule[] }).socialization_schedules ?? [];

    if (schedules.length === 0 && socializationSchedules.length === 0) return null;

    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const getDayLabel = (s: Schedule) => {
        if (s.day?.trim()) {
            return s.day;
        }

        const dateValue = getDate(s);
        if (!dateValue) {
            return '';
        }

        return format(new Date(dateValue), 'EEEE', { locale: id });
    };

    const formatDate = (value: string) => format(new Date(value), 'dd MMMM yyyy', { locale: id });
    const formatTime = (value?: string) => (value ? value.slice(0, 5) : '');

    return (
        <section className="mx-auto mt-16 mb-8 sm:mb-12 w-full max-w-5xl px-4" id="schedules">
            {schedules.length > 0 && (
                <div className="mb-12">
                    <h2 className="dark:text-primary-foreground font-literata mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                        Jadwal Pelaksanaan
                    </h2>
                    <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                        Rangkaian sesi program yang akan dilaksanakan
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {schedules.map((schedule, index) => {
                            const dateValue = getDate(schedule);
                            const startTime = formatTime(schedule.start_time);
                            const endTime = formatTime(schedule.end_time);

                            return (
                                <div
                                    key={schedule.id}
                                    className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-3 py-1 font-semibold">
                                            Sesi {index + 1}
                                        </Badge>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {getDayLabel(schedule)}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {schedule.title || (dateValue ? formatDate(dateValue) : `Sesi ${index + 1}`)}
                                        </h3>
                                        
                                        <div className="flex flex-col gap-2 mt-4">
                                            {dateValue && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span>{formatDate(dateValue)}</span>
                                                </div>
                                            )}
                                            
                                            {(startTime || endTime) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <span>{startTime || '--:--'} {endTime ? `- ${endTime} WIB` : 'WIB'}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span>Online</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {program.type === 'scholarship' && socializationSchedules.length > 0 && (
                <div>
                    <h2 className="dark:text-primary-foreground font-literata mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                        Jadwal Sosialisasi
                    </h2>
                    <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                        Tahapan awal sosialisasi beasiswa sebelum proses seleksi utama dimulai
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        {socializationSchedules.map((schedule, index) => {
                            const dateValue = getDate(schedule);
                            const startTime = formatTime(schedule.start_time);
                            const endTime = formatTime(schedule.end_time);

                            return (
                                <div
                                    key={schedule.id}
                                    className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                {schedule.title || `Tahap ${index + 1}`}
                                            </h3>
                                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full text-xs shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
                                                Sosialisasi
                                            </Badge>
                                        </div>
                                        
                                        <div className="mt-2 space-y-1">
                                            {dateValue && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <span className="font-medium min-w-[60px]">Tanggal</span>
                                                    <span>: {getDayLabel(schedule)}, {formatDate(dateValue)}</span>
                                                </p>
                                            )}
                                            {(startTime || endTime) && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <span className="font-medium min-w-[60px]">Waktu</span>
                                                    <span>: {startTime || '--:--'} {endTime ? `- ${endTime} WIB` : 'WIB'}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
