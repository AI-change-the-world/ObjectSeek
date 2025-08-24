import React, { useState, useEffect, useRef } from "react";
import { Spin, Card, Progress, Row, Col, Typography, Alert, Badge } from "antd";
import {
    DesktopOutlined,
    DatabaseOutlined,
    ThunderboltOutlined,
    FireOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import type { SystemInfo } from "./api";
import getMonitorStatus from "./api";

const { Title, Text } = Typography;

const SystemMonitor: React.FC = () => {
    const [data, setData] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorTimes, setErrorTimes] = useState(0);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');

    const timerRef = useRef<NodeJS.Timer | null>(null);

    // 获取状态颜色
    const getStatusColor = (percent: number): string => {
        if (percent < 30) return '#52c41a'; // 绿色
        if (percent < 60) return '#faad14'; // 黄色
        if (percent < 80) return '#fa8c16'; // 橙色
        return '#f5222d'; // 红色
    };

    // 获取温度颜色
    const getTemperatureColor = (temp: number): string => {
        if (temp < 60) return '#52c41a';
        if (temp < 75) return '#faad14';
        if (temp < 85) return '#fa8c16';
        return '#f5222d';
    };

    // 获取性能等级
    const getPerformanceLevel = (percent: number): { text: string; color: string; icon: React.ReactNode } => {
        if (percent < 30) return { text: '优秀', color: '#52c41a', icon: <CheckCircleOutlined /> };
        if (percent < 60) return { text: '良好', color: '#faad14', icon: <CheckCircleOutlined /> };
        if (percent < 80) return { text: '警告', color: '#fa8c16', icon: <ExclamationCircleOutlined /> };
        return { text: '危险', color: '#f5222d', icon: <WarningOutlined /> };
    };

    useEffect(() => {
        // 立即获取一次数据
        fetchSystemInfo();
        // 然后设置定时器
        timerRef.current = setInterval(fetchSystemInfo, 3000); // 3秒更新一次

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchSystemInfo = async () => {
        try {
            setConnectionStatus('connected');
            const res = await getMonitorStatus();

            if (res?.data) {
                setData(res.data);
                setLastUpdateTime(new Date());
                setErrorTimes(0);
            } else {
                setErrorTimes(prev => {
                    const next = prev + 1;
                    if (next > 5) {
                        setConnectionStatus('error');
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                    } else {
                        setConnectionStatus('disconnected');
                    }
                    return next;
                });
            }
        } catch (error) {
            setConnectionStatus('disconnected');
            setErrorTimes(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };

    // 错误状态
    if (errorTimes > 5) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <WarningOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                    <Title level={2} style={{ color: 'white', margin: 0 }}>
                        系统连接中断
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                        无法获取系统监控信息，请检查网络连接
                    </Text>
                </div>
            </div>
        );
    }

    // 加载状态
    if (loading || !data) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Spin size="large" style={{ color: 'white' }} />
                    <div style={{ marginTop: 16, fontSize: 16 }}>
                        获取系统信息中...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '24px'
        }}>
            {/* 标题和状态栏 */}
            <div style={{
                marginBottom: 32,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
            }}>


                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Badge
                        status={connectionStatus === 'connected' ? 'success' : connectionStatus === 'disconnected' ? 'warning' : 'error'}
                        text={
                            <span style={{ fontSize: 14, fontWeight: 500 }}>
                                {connectionStatus === 'connected' ? '在线' : connectionStatus === 'disconnected' ? '连接中' : '离线'}
                            </span>
                        }
                    />
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                        上次更新: {lastUpdateTime.toLocaleTimeString()}
                    </Text>
                </div>
            </div>

            {connectionStatus !== 'connected' && (
                <Alert
                    message="连接状态异常"
                    description="系统监控服务连接不稳定，数据可能不是最新的"
                    type="warning"
                    showIcon
                    style={{
                        marginBottom: 24,
                        borderRadius: 12,
                        border: 'none'
                    }}
                />
            )}

            <Row gutter={[24, 24]}>
                {/* 第一行：CPU 使用率 */}
                <Col xs={24} lg={24}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            height: '180px'
                        }}
                        bodyStyle={{
                            padding: '24px',
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}>
                                    CPU 使用率
                                </Text>
                                <div style={{
                                    fontSize: 32,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginTop: 4
                                }}>
                                    {data.cpu_percent.toFixed(1)}%
                                </div>
                            </div>
                            <DesktopOutlined style={{ fontSize: 48, opacity: 0.8 }} />
                        </div>
                        <div>
                            <Progress
                                percent={data.cpu_percent}
                                strokeColor="rgba(255,255,255,0.9)"
                                trailColor="rgba(255,255,255,0.2)"
                                showInfo={false}
                                strokeWidth={8}
                                style={{ marginBottom: 8 }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Badge
                                    color={getStatusColor(data.cpu_percent)}
                                    text={
                                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            {getPerformanceLevel(data.cpu_percent).text}
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* 第二行：内存使用情况 */}
                <Col xs={24} md={12} lg={12}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            height: '180px'
                        }}
                        bodyStyle={{
                            padding: '24px',
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}>
                                    内存使用情况
                                </Text>
                                <div style={{
                                    fontSize: 32,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginTop: 4
                                }}>
                                    {data.memory.percent.toFixed(1)}%
                                </div>
                            </div>
                            <DatabaseOutlined style={{ fontSize: 48, opacity: 0.8 }} />
                        </div>
                        <div>
                            <Progress
                                percent={data.memory.percent}
                                strokeColor="rgba(255,255,255,0.9)"
                                trailColor="rgba(255,255,255,0.2)"
                                showInfo={false}
                                strokeWidth={8}
                                style={{ marginBottom: 8 }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Badge
                                    color={getStatusColor(data.memory.percent)}
                                    text={
                                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            {getPerformanceLevel(data.memory.percent).text}
                                        </span>
                                    }
                                />
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                    {data.memory.used_gb.toFixed(1)} / {data.memory.total_gb.toFixed(1)} GB
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* 第二行：GPU 概览 */}
                <Col xs={24} md={12} lg={12}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            height: '180px'
                        }}
                        bodyStyle={{
                            padding: '24px',
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}>
                                    GPU 概览
                                </Text>
                                <div style={{
                                    fontSize: 32,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginTop: 4
                                }}>
                                    {Object.keys(data.gpu).length} 设备
                                </div>
                            </div>
                            <ThunderboltOutlined style={{ fontSize: 48, opacity: 0.8 }} />
                        </div>
                        <div>
                            <Progress
                                percent={Object.values(data.gpu).reduce((acc, gpu) => acc + gpu.load_percent, 0) / Object.keys(data.gpu).length}
                                strokeColor="rgba(255,255,255,0.9)"
                                trailColor="rgba(255,255,255,0.2)"
                                showInfo={false}
                                strokeWidth={8}
                                style={{ marginBottom: 8 }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Badge
                                    color={getStatusColor(Object.values(data.gpu).reduce((acc, gpu) => acc + gpu.load_percent, 0) / Object.keys(data.gpu).length)}
                                    text={
                                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            平均使用率
                                        </span>
                                    }
                                />
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                    {(Object.values(data.gpu).reduce((acc, gpu) => acc + gpu.load_percent, 0) / Object.keys(data.gpu).length).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* 第二行：系统概览 */}
                <Col xs={24} md={12} lg={12}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            height: '180px'
                        }}
                        bodyStyle={{
                            padding: '24px',
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}>
                                    系统概览
                                </Text>
                                <div style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginTop: 4
                                }}>
                                    {data.system.hostname}
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: 2
                                }}>
                                    {data.system.os}
                                </div>
                            </div>
                            <FireOutlined style={{ fontSize: 48, opacity: 0.8 }} />
                        </div>
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8
                            }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                    CPU核心/线程
                                </span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                                    {data.cpu_cores}核/{data.cpu_threads}线程
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                    磁盘数量
                                </span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                                    {data.disks.length} 个设备
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SystemMonitor;