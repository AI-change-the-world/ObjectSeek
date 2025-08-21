import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from "antd";
import { WordCloud } from '@ant-design/charts';
import { useEffect, useState } from 'react';
import { fetchDashboardData, type DashboardData } from './api';



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {


    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchDashboardData();
                if (res != null) {
                    setData(res?.data ?? null);
                }

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (data == null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">数据加载失败</div>
            </div>
        );
    }


    /** 词云数据 */
    const scenarioWordCloudData = data.scenario_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 100) + 10,
        id: index,
    }));

    const algorithmWordCloudData = data.algorithm_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 100) + 10,
        id: index,
    }));

    const wordCloudConfig = (source: typeof scenarioWordCloudData) => ({
        data: source,
        wordField: "text",
        weightField: "value",
        colorField: "text",
        wordStyle: {
            fontFamily: "Verdana",
            fontSize: [20, 60],
            rotation: 0,
        },
        random: 0.5,
    });

    /** 新增：流类型分布 */
    const streamTypeData = data.stream_details.stream_type_counts.map((d: { stream_type: any; count: any; }) => ({
        name: d.stream_type,
        value: d.count,
    }));

    /** 新增：场景分布 */
    const scenarioCountData = data.stream_details.scenario_counts.map((d: { name: any; count: any; }) => ({
        name: d.name,
        value: d.count,
    }));

    return (
        <div style={{ padding: "12px 24px" }}>
            <div style={{ marginBottom: 16, fontWeight: 700 }}>数据仪表盘</div>

            {/* 总览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                    <div className="text-lg text-gray-500">总场景数</div>
                    <div className="text-2xl font-bold">{data.total_scenario}</div>
                </Card>
                <Card>
                    <div className="text-lg text-gray-500">总视频数</div>
                    <div className="text-2xl font-bold">{data.total_video}</div>
                </Card>
                <Card>
                    <div className="text-lg text-gray-500">总算法数</div>
                    <div className="text-2xl font-bold">{data.total_algorithm}</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 总体分布 */}
                {/* <Card title="数据分布">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent ?? 0 * 100).toFixed(0)}%`
                                    }
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card> */}

                {/* 数据统计（条形图） */}
                {/* <Card title="数据统计">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pieData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card> */}

                {/* 新增：流类型分布 */}
                <Card title="流类型分布">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={streamTypeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    dataKey="value"
                                    label
                                >
                                    {streamTypeData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 新增：场景分布 */}
                <Card title="场景分布">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scenarioCountData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ff7f50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 场景词云 */}
                <Card title="场景词云">
                    <div style={{ height: 320 }}>
                        <WordCloud {...wordCloudConfig(scenarioWordCloudData)} />
                    </div>
                </Card>

                {/* 算法词云 */}
                <Card title="算法词云">
                    <div style={{ height: 320 }}>
                        <WordCloud {...wordCloudConfig(algorithmWordCloudData)} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;