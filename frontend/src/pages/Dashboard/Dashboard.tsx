import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, Row, Col, Spin } from "antd";
import { WordCloud } from '@ant-design/charts';
import {
    VideoCameraOutlined,
    PlayCircleOutlined,
    BranchesOutlined,
    RiseOutlined,
    EyeOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { fetchDashboardData, type DashboardData } from './api';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
const GRADIENT_COLORS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
];

const Dashboard = () => {


    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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

    // 加载状态
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <Spin size="large" style={{ color: 'white' }} />
                    <div style={{ marginTop: 16, fontSize: 16 }}>加载中...</div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (data == null) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white',
                    fontSize: 18
                }}>
                    <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>数据加载失败</div>
                </div>
            </div>
        );
    }


    /** 词云数据 */
    const scenarioWordCloudData = data.scenario_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 80) + 20,
        id: index,
    }));

    const algorithmWordCloudData = data.algorithm_wordcloud.map((word, index) => ({
        text: word,
        value: Math.floor(Math.random() * 80) + 20,
        id: index,
    }));

    const wordCloudConfig = (source: typeof scenarioWordCloudData) => ({
        data: source,
        wordField: "text",
        weightField: "value",
        colorField: "text",
        wordStyle: {
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: [16, 48],
            rotation: [-45, 0, 45],
            rotationSteps: 3,
        },
        spiral: 'archimedean',
        random: 0.5,
        color: COLORS,
    });

    /** 流类型分布 */
    const streamTypeData = data.stream_details.stream_type_counts.map((d: { stream_type: any; count: any; }, index: number) => ({
        name: d.stream_type === 'file' ? '视频文件' : d.stream_type === 'stream' ? '视频流' : '其他',
        value: d.count,
        color: COLORS[index % COLORS.length],
    }));

    /** 场景分布 */
    const scenarioCountData = data.stream_details.scenario_counts.map((d: { name: any; count: any; }, index: number) => ({
        name: d.name,
        value: d.count,
        fill: COLORS[index % COLORS.length],
    }));

    // 统计卡片配置
    const statsCards = [
        {
            title: '总场景数',
            value: data.total_scenario,
            icon: <BranchesOutlined />,
            gradient: GRADIENT_COLORS[0],
            suffix: '个'
        },
        {
            title: '总视频数',
            value: data.total_video,
            icon: <VideoCameraOutlined />,
            gradient: GRADIENT_COLORS[1],
            suffix: '个'
        },
        {
            title: '总算法数',
            value: data.total_algorithm,
            icon: <ThunderboltOutlined />,
            gradient: GRADIENT_COLORS[2],
            suffix: '个'
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '24px'
        }}>


            {/* 统计卡片 */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {statsCards.map((card, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card
                            style={{
                                background: card.gradient,
                                border: 'none',
                                borderRadius: 16,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            bodyStyle={{
                                padding: '24px',
                                color: 'white'
                            }}
                            hoverable
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: 14,
                                        opacity: 0.9,
                                        marginBottom: 8,
                                        fontWeight: 500
                                    }}>
                                        {card.title}
                                    </div>
                                    <div style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        lineHeight: 1
                                    }}>
                                        {card.value}{card.suffix}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 48,
                                    opacity: 0.8
                                }}>
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 图表区域 */}
            <Row gutter={[24, 24]}>
                {/* 流类型分布 */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1e293b'
                            }}>
                                <PlayCircleOutlined style={{ marginRight: 8, color: '#667eea' }} />
                                流类型分布
                            </div>
                        }
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e2e8f0'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={streamTypeData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {streamTypeData.map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: 8,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* 场景分布 */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1e293b'
                            }}>
                                <RiseOutlined style={{ marginRight: 8, color: '#f093fb' }} />
                                场景分布
                            </div>
                        }
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e2e8f0'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scenarioCountData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: 8,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[4, 4, 0, 0]}
                                        fill="url(#barGradient)"
                                    >
                                        {scenarioCountData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* 场景词云 */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1e293b'
                            }}>
                                <BranchesOutlined style={{ marginRight: 8, color: '#4facfe' }} />
                                场景词云
                            </div>
                        }
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e2e8f0'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{
                            height: 320,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            borderRadius: 12,
                            padding: 16
                        }}>
                            <WordCloud {...wordCloudConfig(scenarioWordCloudData)} />
                        </div>
                    </Card>
                </Col>

                {/* 算法词云 */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1e293b'
                            }}>
                                <ThunderboltOutlined style={{ marginRight: 8, color: '#43e97b' }} />
                                算法词云
                            </div>
                        }
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e2e8f0'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{
                            height: 320,
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            borderRadius: 12,
                            padding: 16
                        }}>
                            <WordCloud {...wordCloudConfig(algorithmWordCloudData)} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;