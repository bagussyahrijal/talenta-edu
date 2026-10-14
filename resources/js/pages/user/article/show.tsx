import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useInitials } from '@/hooks/use-initials';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { BookText, Calendar, Clock, Eye, MonitorPlay, Presentation, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Category {
    id: string;
    name: string;
}

interface Author {
    id: string;
    name: string;
    bio: string;
    avatar?: string;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    category: Category;
    user: Author;
    read_time: number;
    views: number;
    published_at: string;
    created_at: string;
}

interface RelatedArticle {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    thumbnail?: string;
    read_time: number;
    published_at: string;
}

interface ArticleShowProps {
    article: Article;
    relatedArticles: RelatedArticle[];
}

export default function ArticleShow({ article, relatedArticles }: ArticleShowProps) {
    const { t, i18n } = useTranslation('user');
    const dateFnsLocale = i18n.language === 'en' ? enUS : id;
    const getInitials = useInitials();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.excerpt || article.title,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('article.linkCopied'));
        }
    };

    return (
        <UserLayout>
            <Head title={article.title} />

            {/* Hero Section */}
            <div className="relative mb-8">
                {article.thumbnail && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl shadow-lg"
                    >
                        <img
                            src={`/storage/${article.thumbnail}`}
                            alt={article.title}
                            className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute left-0 bottom-0 p-6 w-full text-white">
                            <Badge variant="secondary" className="mb-2 bg-primary/80 text-white">
                                {article.category.name}
                            </Badge>
                            <h1 className="mb-2 text-2xl md:text-4xl font-bold drop-shadow">{article.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm opacity-90">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7 border-2 border-white">
                                        <AvatarImage src={article.user.avatar} alt={article.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getInitials(article.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{article.user.name}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4 bg-white/40" />
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(article.published_at), 'dd MMMM yyyy', { locale: dateFnsLocale })}
                                </div>
                                <Separator orientation="vertical" className="h-4 bg-white/40" />
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {t('article.minRead', { count: article.read_time })}
                                </div>
                                <Separator orientation="vertical" className="h-4 bg-white/40" />
                                <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {t('article.views', { count: article.views.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID') })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mx-auto max-w-5xl px-2 md:px-0 grid grid-cols-1 gap-10 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <article>
                        {/* Excerpt */}
                        {article.excerpt && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="border-primary bg-primary/5 mb-6 rounded-lg border-l-4 p-4"
                            >
                                <p className="text-muted-foreground">{article.excerpt}</p>
                            </motion.div>
                        )}

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="prose prose-lg prose-slate dark:prose-invert max-w-none"
                        >
                            {article.content ? (
                                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                            ) : (
                                <p className="text-muted-foreground">{t('article.noContent')}</p>
                            )}
                        </motion.div>

                        {/* Author Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-12 flex items-center gap-4 rounded-xl bg-primary/10 p-6"
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={article.user.avatar} alt={article.user.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {getInitials(article.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="mb-1 font-semibold">{t('article.aboutAuthor')}</h3>
                                <p className="text-lg font-medium">{article.user.name === 'Admin' ? t('article.team') : article.user.name}</p>
                                <p className="text-muted-foreground text-sm">{article.user.bio}</p>
                            </div>
                        </motion.div>
                    </article>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    {/* Share Button - sticky on desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="sticky top-24 z-10"
                    >
                        <button
                            onClick={handleShare}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold shadow transition"
                        >
                            <Share2 className="h-5 w-5" />
                            {t('article.shareArticle')}
                        </button>
                    </motion.div>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="rounded-xl border bg-white p-4 shadow-sm"
                        >
                            <h3 className="mb-4 font-semibold">{t('article.relatedArticles')}</h3>
                            <div className="space-y-4">
                                {relatedArticles.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/article/${related.slug}`}
                                        className="group flex gap-3 rounded-lg border hover:border-primary/40 p-2 transition"
                                    >
                                        <img
                                            src={related.thumbnail ? `/storage/${related.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={related.title}
                                            className="h-16 w-20 flex-shrink-0 rounded object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="group-hover:text-primary line-clamp-2 text-sm font-medium">{related.title}</h4>
                                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                                <Clock className="h-3 w-3" />
                                                {t('article.min', { count: related.read_time })}
                                                <Calendar className="h-3 w-3 ml-2" />
                                                {format(new Date(related.published_at), 'dd MMM', { locale: dateFnsLocale })}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-primary text-primary-foreground rounded-xl p-6 shadow"
                    >
                        <h3 className="mb-2 text-lg font-semibold">{t('article.wantToLearnMore')}</h3>
                        <p className="mb-4 text-sm opacity-90">{t('article.ctaDesc')}</p>
                        <div className="space-y-2">
                            <Link
                                href="/course"
                                className="group flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                            >
                                <BookText className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                <span>{t('article.viewCourses')}</span>
                            </Link>
                            <Link
                                href="/bootcamp"
                                className="group flex items-center gap-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                            >
                                <Presentation className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                <span>{t('article.viewBootcamps')}</span>
                            </Link>
                            {/* <Link
                                href="/webinar"
                                className="group flex items-center gap-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                            >
                                <MonitorPlay className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                <span>Lihat Webinar</span>
                            </Link> */}
                        </div>
                    </motion.div>
                </div>
            </div>
        </UserLayout>
    );
}