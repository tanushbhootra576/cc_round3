import {
    Car, Droplets, Zap, Construction, Wind, CloudRain, MoreHorizontal, Clock,
} from 'lucide-react';

const CAT_ICON = {
    traffic: Car, water: Droplets, power: Zap, drainage: CloudRain,
    construction: Construction, pollution: Wind, other: MoreHorizontal,
};

const CAT_STYLE = {
    traffic: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', label: 'bg-orange-100 text-orange-700' },
    water: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', label: 'bg-cyan-100 text-cyan-700' },
    power: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'bg-amber-100 text-amber-700' },
    drainage: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', label: 'bg-blue-100 text-blue-700' },
    construction: { bg: 'bg-gray-50', border: 'border-gray-300', icon: 'text-gray-600', label: 'bg-gray-100 text-gray-700' },
    pollution: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', label: 'bg-purple-100 text-purple-700' },
    other: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500', label: 'bg-gray-100 text-gray-600' },
};

const SEV_STYLE = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
};

const CAT_EMOJI = {
    traffic: '🚗', water: '💧', power: '⚡', drainage: '🌊',
    construction: '🚧', pollution: '🏭', other: '📢',
};

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AlertCard({ alert }) {
    const style = CAT_STYLE[alert.category] || CAT_STYLE.other;
    const CatIcon = CAT_ICON[alert.category] || MoreHorizontal;
    const isCritical = alert.severity === 'critical';

    return (
        <div className={`${style.bg} border ${style.border} rounded-lg p-4 transition-all hover:shadow-md fade-in ${isCritical ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.label}`}>
                    <CatIcon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-lg leading-none`}>{CAT_EMOJI[alert.category] || '📢'}</span>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{alert.title}</h3>
                        {isCritical && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{alert.description}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity badge */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${SEV_STYLE[alert.severity]}`}>
                            {alert.severity}
                        </span>

                        {/* Category label */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.label}`}>
                            {alert.category}
                        </span>

                        {/* Zone */}
                        {alert.zone && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                                📍 {alert.zone}
                            </span>
                        )}

                        {/* Time ago */}
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 ml-auto">
                            <Clock size={9} /> {timeAgo(alert.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
