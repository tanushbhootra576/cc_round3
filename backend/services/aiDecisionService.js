import Ward from '../models/Ward.js';

/**
 * Generates AI-driven operational recommendations based on current city state.
 * Uses deterministic logic as fallback if no LLM configured.
 */
export const generateOperationalAIPlan = async (wardId = null) => {
    const query = wardId ? { _id: wardId } : {};
    const wards = await Ward.find(query);

    const recommendations = [];

    for (const ward of wards) {
        const issues = [];

        // Check for critical thresholds
        if (ward.resources.power.utilization > 90) {
            issues.push({
                sector: 'Power',
                severity: 'Critical',
                msg: 'Grid overload detected. Initiate rolling brownouts in non-essential zones or activate reserve capacitors.'
            });
        }

        if (ward.resources.traffic.utilization > 85) {
            issues.push({
                sector: 'Traffic',
                severity: 'High',
                msg: 'Heavy congestion. Adjust signal timings on main arteries and deploy additional traffic wardens to key intersections.'
            });
        }

        if (ward.resources.water.utilization > 95) {
            issues.push({
                sector: 'Water',
                severity: 'Critical',
                msg: 'Water demand exceeding supply cap. Check for undetected major leaks or curtail industrial supply temporarily.'
            });
        }

        if (ward.currentHealthIndex < 50) {
            recommendations.push({
                ward: ward.name,
                wardId: ward.wardId,
                status: 'Emergency',
                primaryTask: 'Inter-departmental Emergency Response',
                plan: issues.length > 0 ? issues : [{ sector: 'General', severity: 'Emergency', msg: 'Multiple systems failing. Deploy field inspectors immediately.' }]
            });
        } else if (issues.length > 0) {
            recommendations.push({
                ward: ward.name,
                wardId: ward.wardId,
                status: 'Optimization Required',
                primaryTask: 'Resource Redistribution',
                plan: issues
            });
        }
    }

    // City-wide summary if no wardId provided
    if (!wardId && recommendations.length === 0) {
        return [{
            status: 'Stable',
            msg: 'All city systems operating within optimal parameters. No immediate action required.',
            chi: await calculateAverageCHI()
        }];
    }

    return recommendations;
};

/**
 * AI Budget Redistribution Recommendation
 */
export const recommendBudgetRedistribution = async () => {
    const wards = await Ward.find();
    const insights = [];

    wards.forEach(w => {
        Object.keys(w.resources).forEach(key => {
            const res = w.resources[key];
            if (res.utilization > 80 && res.budget < 80000) {
                insights.push({
                    ward: w.name,
                    sector: key,
                    reason: 'High utilization vs low funding budget',
                    recommendation: `Increase ${key} budget by 25% for infrastructure hardening.`
                });
            }
        });
    });

    return {
        timestamp: new Date(),
        recommendations: insights.slice(0, 5), // Top 5
        summary: insights.length > 0
            ? `Identified ${insights.length} sector-ward combinations requiring budget reallocation.`
            : "Current budget distribution appears efficient for observed demand levels."
    };
};

const calculateAverageCHI = async () => {
    const wards = await Ward.find();
    if (wards.length === 0) return 0;
    return Math.round(wards.reduce((acc, w) => acc + w.currentHealthIndex, 0) / wards.length);
};
