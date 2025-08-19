import { Spin, Card, Progress, Descriptions } from "antd";
import { useState, useEffect, useRef } from "react";
import type { SystemInfo } from "./api";
import getMonitorStatus from "./api";

const SystemMonitor: React.FC = () => {
    const [data, setData] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorTimes, setErrorTimes] = useState(0);

    const timerRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(fetchSystemInfo, 5000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchSystemInfo = async () => {
        try {
            const res = await getMonitorStatus();
            setData(res?.data ?? null);

            if (!res?.data) {
                setErrorTimes(prev => {
                    const next = prev + 1;
                    if (next > 5 && timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    return next;
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (errorTimes > 5) {
        return (<div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',  // 或指定具体高度
        }}>
            无法获取系统信息
        </div>);
    }


    if (loading || !data) {
        return (<div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',  // 或指定具体高度
        }}>
            <Spin />
        </div>);
    }

    return (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* CPU */}
            <Card title="CPU 使用率">
                <Progress percent={data.cpu} />
            </Card>

            {/* Memory */}
            <Card title="内存使用情况">
                <Progress
                    type="circle"
                    percent={data.memory.percent}
                    format={() => `${data.memory.used_gb.toFixed(1)} / ${data.memory.total_gb.toFixed(1)} GB`}
                />
            </Card>

            {/* GPU */}
            {Object.values(data.gpu).map((gpu) => (
                <Card key={gpu.id} title={`GPU-${gpu.id}: ${gpu.name}`}>
                    <Descriptions column={1}>
                        <Descriptions.Item label="使用率">
                            <Progress percent={gpu.load_percent} />
                        </Descriptions.Item>
                        <Descriptions.Item label="显存">
                            {gpu.memory_used_gb.toFixed(1)} / {gpu.memory_total_gb.toFixed(1)} GB
                            <Progress percent={gpu.memory_percent} size="small" />
                        </Descriptions.Item>
                        {gpu.temperature_c !== undefined && (
                            <Descriptions.Item label="温度">{gpu.temperature_c} ℃</Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>
            ))}
        </div>
    );
};

export default SystemMonitor;