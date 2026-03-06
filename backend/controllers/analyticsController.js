import Issue from '../models/Issue.js';
import CityAlert from '../models/CityAlert.js';

// ════════════════════════════════════════════════════════════
//  ADVANCED ANALYTICS + BUDGET ALLOCATION (Government only)
// ════════════════════════════════════════════════════════════

// Simulated per-zone budget allocation (₹ Lakhs)
const ZONE_BUDGETS = {
    'Ward 1': 45, 'Ward 2': 38, 'Ward 3': 52, 'Ward 4': 30,
    'Ward 5': 60, 'Ward 6': 42, 'Ward 7': 55, 'Ward 8': 35,
    'Ward 9': 48, 'Ward 10': 40, 'Central': 75, 'North': 65,
    'South': 58, 'East': 50, 'West': 47, 'Other': 20,
};

// Cost-per-category estimates (₹ Lakhs)
const CATEGORY_COSTS = {
    pothole: 2.5, streetlight: 1.8, drainage: 4.0, garbage: 1.5,
    water: 3.2, road: 5.0, sanitation: 2.0, noise: 0.8,
    traffic: 3.5, other: 2.0,
};

// GET /api/analytics/overview — comprehensive analytics dashboard data
export const getAnalyticsOverview = async (_req, res) => {
    try {
        const [
            totalIssues,
            statusAgg,
            categoryAgg,
            severityAgg,
            monthlyTrend,
            avgSeverity,
            activeAlerts,
            zoneAgg,
        ] = await Promise.all([
            Issue.countDocuments(),
            Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            Issue.aggregate([
                {
                    $bucket: {
                        groupBy: '$severityScore', boundaries: [0, 30, 50, 70, 90, 101], default: 'unknown',
                        output: { count: { $sum: 1 }, avgScore: { $avg: '$severityScore' } }
                    }
                },
            ]),
            Issue.aggregate([
                {
                    $group: {
                        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 },
                        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                    }
                },
                { $sort: { '_id.y': -1, '_id.m': -1 } },
                { $limit: 12 },
            ]),
            Issue.aggregate([{ $group: { _id: null, avgSev: { $avg: '$severityScore' }, maxSev: { $max: '$severityScore' } } }]),
            CityAlert.countDocuments({ isActive: true }),
            Issue.aggregate([
                { $match: { 'location.coordinates': { $exists: true } } },
                {
                    $group: {
                        _id: '$category', count: { $sum: 1 },
                        avgLat: { $avg: { $arrayElemAt: ['$location.coordinates', 1] } },
                        avgLng: { $avg: { $arrayElemAt: ['$location.coordinates', 0] } },
                    }
                },
            ]),
        ]);

        const statusMap = {};
        statusAgg.forEach(s => { statusMap[s._id] = s.count; });

        const pending = statusMap['pending'] || 0;
        const inProgress = statusMap['in-progress'] || 0;
        const resolved = statusMap['resolved'] || 0;
        const resolutionRate = totalIssues ? Math.round((resolved / totalIssues) * 100) : 0;
        const avgResponseDays = Math.round(2 + Math.random() * 5); // simulated

        // Congestion detection — zones with high alert density
        const congestionZones = await CityAlert.aggregate([
            { $match: { isActive: true, category: 'traffic' } },
            { $group: { _id: '$zone', count: { $sum: 1 }, latestSeverity: { $max: '$severity' } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        res.json({
            totalIssues, pending, inProgress, resolved, resolutionRate,
            avgResponseDays,
            activeAlerts,
            categoryBreakdown: categoryAgg,
            severityDistribution: severityAgg,
            monthlyTrend: monthlyTrend.reverse(),
            avgSeverityScore: avgSeverity[0]?.avgSev ?? 0,
            maxSeverityScore: avgSeverity[0]?.maxSev ?? 0,
            congestionZones,
            zoneHotspots: zoneAgg,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/analytics/budget — budget allocation vs demand analysis
export const getBudgetAnalysis = async (_req, res) => {
    try {
        const categoryAgg = await Issue.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgSeverity: { $avg: '$severityScore' },
                    pending: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                }
            },
            { $sort: { count: -1 } },
        ]);

        // Compute demand (unresolved issues × cost) vs allocated budget
        const sectorFunding = categoryAgg.map(cat => {
            const costPerIssue = CATEGORY_COSTS[cat._id] || 2.0;
            const totalDemand = cat.pending * costPerIssue;
            const allocated = costPerIssue * cat.count * 0.6; // 60% of total est. cost
            const gap = totalDemand - allocated;
            const efficiency = cat.count > 0 ? Math.round((cat.resolved / cat.count) * 100) : 0;

            return {
                category: cat._id,
                issueCount: cat.count,
                pendingCount: cat.pending,
                resolvedCount: cat.resolved,
                avgSeverity: Math.round(cat.avgSeverity || 0),
                costPerIssue,
                totalDemand: Math.round(totalDemand * 10) / 10,
                allocated: Math.round(allocated * 10) / 10,
                gap: Math.round(gap * 10) / 10,
                efficiency,
                isUnderfunded: gap > 0,
            };
        });

        // Zone-based budget utilization
        const zoneBreakdown = Object.entries(ZONE_BUDGETS).map(([zone, budget]) => {
            const demand = Math.round(budget * (0.4 + Math.random() * 0.8) * 10) / 10;
            const utilized = Math.round(budget * (0.3 + Math.random() * 0.6) * 10) / 10;
            const surplus = Math.round((budget - demand) * 10) / 10;
            return {
                zone,
                budget,
                demand,
                utilized,
                surplus,
                utilizationRate: Math.round((utilized / budget) * 100),
                isOverbudget: demand > budget,
            };
        });

        const totalBudget = Object.values(ZONE_BUDGETS).reduce((a, b) => a + b, 0);
        const totalDemand = sectorFunding.reduce((a, b) => a + b.totalDemand, 0);
        const totalAllocated = sectorFunding.reduce((a, b) => a + b.allocated, 0);
        const underfundedSectors = sectorFunding.filter(s => s.isUnderfunded).length;
        const overbudgetZones = zoneBreakdown.filter(z => z.isOverbudget).length;

        // AI redistribution recommendations
        const recommendations = sectorFunding
            .filter(s => s.isUnderfunded && s.gap > 1)
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 5)
            .map(s => ({
                category: s.category,
                action: `Increase funding for ${s.category} by ₹${s.gap.toFixed(1)}L — ${s.pendingCount} unresolved issues remain`,
                priority: s.avgSeverity >= 60 ? 'high' : s.avgSeverity >= 40 ? 'medium' : 'low',
                gap: s.gap,
            }));

        res.json({
            totalBudget,
            totalDemand: Math.round(totalDemand * 10) / 10,
            totalAllocated: Math.round(totalAllocated * 10) / 10,
            underfundedSectors,
            overbudgetZones,
            sectorFunding,
            zoneBreakdown,
            recommendations,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/analytics/congestion — active congestion alerts with severity
export const getCongestionAlerts = async (_req, res) => {
    try {
        const trafficAlerts = await CityAlert.find({ isActive: true, category: 'traffic' })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('createdBy', 'name')
            .lean();

        const zoneSummary = await CityAlert.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$zone', count: { $sum: 1 },
                    criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
                    categories: { $addToSet: '$category' },
                }
            },
            { $sort: { count: -1 } },
            { $limit: 15 },
        ]);

        res.json({ trafficAlerts, zoneSummary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
