// pages/VideoList.tsx
import { useState } from "react";
import { Row, Col, Select, Input, Typography, Empty, Button, Space } from "antd";
import { mockVideos } from "./mock";
import VideoWidget from "./video";


const { Option } = Select;
const { Search } = Input;

export default function StreamManagement() {
    const [category, setCategory] = useState<number | null>(null);
    const [keyword, setKeyword] = useState("");

    // 模拟分类映射
    const categories: Record<number, string> = {
        1: "安防监控",
        2: "商业分析",
        3: "其他",
    };

    const filtered = mockVideos.filter((v) => {
        const matchCategory = category ? v.category === category : true;
        const matchKeyword = keyword
            ? v.title.toLowerCase().includes(keyword.toLowerCase())
            : true;
        return matchCategory && matchKeyword;
    });

    return (
        <div style={{ padding: 20 }}>
            {/* <Title level={5}>视频 / 视频流管理</Title> */}
            <div style={{ marginBottom: 16, fontWeight: 700 }}>视频 / 视频流管理</div>

            {/* 筛选区域 */}
            <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
                <Select
                    placeholder="按业务场景分类"
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => setCategory(val)}
                >
                    {Object.entries(categories).map(([id, name]) => (
                        <Option key={id} value={Number(id)}>
                            {name}
                        </Option>
                    ))}
                </Select>
                <Search
                    placeholder="搜索视频标题"
                    style={{ width: 240 }}
                    allowClear
                    onSearch={(val) => setKeyword(val)}
                />
                <div style={{ flex: 1 }} />

                <Button type="primary" onClick={() => { }}>
                    添加视频
                </Button>
            </div>

            {/* 视频卡片网格 */}
            <Row gutter={[16, 16]}>
                {filtered.length > 0 ? (
                    filtered.map((video) => (
                        <Col key={video.id} xs={24} sm={12} md={8} lg={6}>
                            <VideoWidget {...video} />
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <Empty description="没有找到相关视频" />
                    </Col>
                )}
            </Row>
        </div>
    );
}
