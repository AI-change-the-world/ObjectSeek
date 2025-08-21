import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from "antd";
import { WordCloud } from '@ant-design/charts';
import { useState } from 'react';



interface PieDataItem {
    name: string;
    value: number;
}

interface WordCloudDataItem {
    text: string;
    value: number;
    id: number;
}



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const data = {
        total_scenario: 1,
        scenario_wordcloud: ["1111"],
        total_video: 0,
        total_algorithm: 1,
        algorithm_wordcloud: ["string"]
    };
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const pieData: PieDataItem[] = [
        { name: '场景', value: data.total_scenario },
        { name: '视频', value: data.total_video },
        { name: '算法', value: data.total_algorithm }
    ];

    const scenarioWordCloudData: WordCloudDataItem[] = data.scenario_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 100) + 10,
        id: index
    }));

    const algorithmWordCloudData: WordCloudDataItem[] = data.algorithm_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 100) + 10,
        id: index
    }));

    const scenarioConfig = {
        data: scenarioWordCloudData,
        wordField: 'text',
        weightField: 'value',
        colorField: 'text',
        wordStyle: {
            fontFamily: 'Verdana',
            fontSize: [20, 60],
            rotation: 0,
        },
        random: 0.5,
    };

    const algorithmConfig = {
        data: algorithmWordCloudData,
        wordField: 'text',
        weightField: 'value',
        colorField: 'text',
        wordStyle: {
            fontFamily: 'Verdana',
            fontSize: [20, 60],
            rotation: 0,
        },
        random: 0.5,
    };

    return (
        <div style={{ padding: "12px 24px" }}>
            {/* <h1 className="text-3xl font-bold mb-6">数据仪表盘</h1> */}
            <div style={{ marginBottom: 16, fontWeight: 700 }}>数据仪表盘</div>

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
                <Card title="数据分布">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="数据统计">
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={pieData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="场景词云">
                    <div style={{ height: 320 }}>
                        <WordCloud {...scenarioConfig} />
                    </div>
                </Card>

                <Card title="算法词云">
                    <div style={{ height: 320 }}>
                        <WordCloud {...algorithmConfig} />
                    </div>
                </Card>


            </div>
        </div>
    );
};

export default Dashboard;