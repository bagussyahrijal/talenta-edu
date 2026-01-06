interface Mentor {
    id: number;
    name: string;
    role: string;
    image: string;
}

const mentorsData: Mentor[] = [
    {
        id: 1,
        name: 'David',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 2,
        name: 'Mariam',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 3,
        name: 'Mariam',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 4,
        name: 'David',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 5,
        name: 'Yohanes',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 6,
        name: 'Sophia',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
    {
        id: 7,
        name: 'Liam',
        role: 'Mentor Akuntansi',
        image: '/assets/images/mentors/mentor-1.png',
    },
];

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
    return (
        <section className="relative h-[428px] w-[300px] overflow-hidden rounded-[20px] bg-secondary/50 shadow-xl ">

            {/* Blue Side Bar with "MENTOR" text */}
            <div className="absolute left-0 top-0 h-full w-[90px] rounded-[20px_0px_0px_20px] bg-[#1976d3]">
                <div className="absolute left-1/2 top-1/3 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center justify-center">
                    <span className=" whitespace-nowrap font-literata font-bold text-5xl uppercase leading-none  text-primary" style={{ WebkitTextStroke: '0.5px white' }}>
                        MENTOR
                    </span>
                </div>
            </div>

            {/* Mentor Image */}
            <div className="absolute bottom-0 right-0 h-[340px] w-[220px]">
                <img
                    className="h-full w-full object-cover object-top"
                    alt={`${mentor.name} - ${mentor.role}`}
                    src={mentor.image}
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=1976d3&color=fff&size=400`;
                    }}
                />
            </div>

            {/* Gradient Overlay at bottom */}
            <div className="absolute bottom-0 left-0 h-[120px] w-full  bg-[linear-gradient(180deg,rgba(25,118,211,0)_0%,rgba(25,118,211,1)_26%)] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" />
            {/* Mentor Name */}
            <h3 className="absolute bottom-[45px] left-0 w-full px-6 text-left font-bold text-[28px] leading-tight text-white">
                {mentor.name}
            </h3>

            {/* Mentor Role */}
            <p className="absolute bottom-[20px] left-0 w-full px-6 text-left font-normal text-[14px] text-white/90">
                {mentor.role}
            </p>
        </section>
    );
};

export default function MentorSection() {
    // Pisahkan data menjadi dua baris
    const firstRow = mentorsData.slice(0, 4);
    const secondRow = mentorsData.slice(4);

    return (
        <section className="relative w-full px-8 py-16 md:px-16 ">
            <div className="mx-auto w-full max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="text-5xl font-bold font-literata">
                        Meet Our Mentor
                    </h2>
                </div>

                {/* Mentor Cards Grid */}
                <div className="space-y-4 ">
                    {/* Baris pertama: 4 kolom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
                        {firstRow.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))}
                    </div>
                    {/* Baris kedua: 3 kolom, rata tengah */}
                    {secondRow.length > 0 && (
                        <div className="flex justify-center gap-x-6">
                            {secondRow.map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}