export default function SkeletonLoader({ variant = 'default' }) {
    if (variant === 'card') {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-100"></div>
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Default: Branded "G" loader
    return (
        <div className="flex items-center justify-center py-12">
            <div className="relative">
                {/* Spinning ring */}
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                {/* GREAT DAYS "G" logo in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600 animate-pulse">G</span>
                </div>
            </div>
        </div>
    );
}
