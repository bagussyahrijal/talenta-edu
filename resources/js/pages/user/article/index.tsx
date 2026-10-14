import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserLayout from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { Book, BookCheckIcon, Calendar, Clock, Eye, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Category {
    id: string;
    name: string;
    articles_count: number;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    thumbnail?: string;
    category: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
    };
    read_time: number;
    views: number;
    published_at: string;
}

interface PopularArticle {
    id: string;
    title: string;
    slug: string;
    views: number;
    thumbnail?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ArticleIndexProps {
    articles: {
        data: Article[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    popularArticles: PopularArticle[];
    filters: {
        category?: string;
        sort?: string;
    };
}

export default function ArticleIndex({ articles, categories, popularArticles, filters }: ArticleIndexProps) {
    const { t, i18n } = useTranslation('user');
    const dateFnsLocale = i18n.language === 'en' ? enUS : id;
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || '');
    const [sortBy, setSortBy] = useState<string>(filters.sort || 'latest');

    const handleFilter = (category: string) => {
        setSelectedCategory(category);
        router.get(
            '/article',
            { category: category || undefined, sort: sortBy },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSort = (sort: string) => {
        setSortBy(sort);
        router.get(
            '/article',
            { category: selectedCategory || undefined, sort },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <UserLayout>
            <Head title={t('article.headTitle')} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-8 rounded-xl bg-gradient-to-b from-white to-primary-foreground px-6 py-10 text-center"
            >
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-2">
                    <BookCheckIcon className="h-8 w-8 text-primary mb-2" />
                    <h1 className="mb-2 text-3xl font-bold md:text-4xl">{t('article.title')}</h1>
                    <p className="text-muted-foreground mb-2">{t('article.subtitle')}</p>
                </div>
            </motion.div>

            <div className="mx-auto w-full max-w-7xl px-2 md:px-4">
                {/* Sort & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    {/* Filter kategori horizontal */}
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                        <Button
                            variant={selectedCategory === '' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleFilter('')}
                        >
                            {t('article.allCategories')}
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleFilter(cat.id)}
                            >
                                {cat.name}
                                <span className="ml-2 text-xs text-muted-foreground">{cat.articles_count}</span>
                            </Button>
                        ))}
                    </div>
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('article.sort')}:</span>
                        <Select value={sortBy} onValueChange={handleSort}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={t('article.sort')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">{t('article.sortLatest')}</SelectItem>
                                <SelectItem value="popular">{t('article.sortPopular')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Popular Articles horizontal */}
                {popularArticles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold">{t('article.popularArticles')}</h3>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {popularArticles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                >
                                    <Link
                                        href={`/article/${article.slug}`}
                                        className="group min-w-[260px] max-w-xs flex-shrink-0 rounded-lg border bg-white shadow-sm hover:shadow-md transition"
                                    >
                                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                            <img
                                                src={article.thumbnail ? `/storage/${article.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={article.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{t('article.views', { count: article.views.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID') })}</span>
                                            </div>
                                            <p className="group-hover:text-primary line-clamp-2 text-sm font-medium">{article.title}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Articles Grid */}
                <div className='mb-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mb-2 flex items-center gap-2"
                    >
                        <Book className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold">{t('article.latestArticles')}</h3>
                    </motion.div>
                    {articles.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {articles.data.map((article, index) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                    >
                                        <Link href={`/article/${article.slug}`} className="group">
                                            <div className="h-full overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg">
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={
                                                            article.thumbnail
                                                                ? `/storage/${article.thumbnail}`
                                                                : '/assets/images/placeholder.png'
                                                        }
                                                        alt={article.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {article.category.name}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">• {article.user.name}</span>
                                                    </div>
                                                    <h3 className="group-hover:text-primary mb-2 line-clamp-2 font-semibold">
                                                        {article.title}
                                                    </h3>
                                                    {article.excerpt && (
                                                        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{article.excerpt}</p>
                                                    )}
                                                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {t('article.min', { count: article.read_time })}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                {article.views}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(article.published_at), 'dd MMM yyyy', { locale: dateFnsLocale })}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {articles.last_page > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="mt-8 flex justify-center gap-2"
                                >
                                    {articles.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed"
                        >
                            <p className="text-muted-foreground mb-2 text-lg font-medium">{t('article.notFound')}</p>
                            <p className="text-muted-foreground text-sm">{t('article.notFoundHint')}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}