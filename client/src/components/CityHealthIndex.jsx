import { Zap, Shield, AlertTriangle } from 'lucide-react';

export default function CityHealthIndex({ score, size = 'md' }) {
    const getStatus = (s) => {
        if (s > 80) return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-200' };
        if (s > 60) return { label: 'STABLE', color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-200' };
        if (s > 40) return { label: 'WARNING', color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-200' };
        return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-200' };
    };

    const status = getStatus(score);
    const radius = size === 'lg' ? 70 : 35;
    const stroke = size === 'lg' ? 8 : 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="-rotate-90"
                >
                    <circle
                        stroke="#f3f4f6"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={`${status.color} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-black mono leading-none ${size === 'lg' ? 'text-3xl' : 'text-sm'}`}>
                        {Math.round(score)}%
                    </span>
                    {size === 'lg' && (
                        <span className="mono text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            RESI_INDEX
                        </span>
                    )}
                </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full border ${status.border} ${status.color} bg-white text-[8px] font-black mono tracking-widest animate-pulse`}>
                {status.label}
            </div>
        </div>
    );
}
