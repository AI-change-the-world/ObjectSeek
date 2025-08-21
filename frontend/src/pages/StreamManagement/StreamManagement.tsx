import React, { useEffect, useState } from "react";
import { Card, Spin, Input, Tabs } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchData, type StreamProps } from "./api";
import TabPane from "antd/es/tabs/TabPane";



const StreamManagement: React.FC = () => {
    const [data, setData] = useState<StreamProps[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
    const [keyword, setKeyword] = useState("");

    const load = async () => {
        if (loading) return;
        setLoading(true);

        const res = await fetchData(page, 10, activeTab ?? 0);

        if (res) {
            setData((prev) => [...prev, ...res.records]);
            setPage((prev) => prev + 1);
            setTotal(res.total);

            setHasMore((data.length + res.records.length) < res.total);
        }

        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [activeTab, keyword]);



    return (
        <div style={{ padding: "12px 24px" }}>
            <div style={{ marginBottom: 16, fontWeight: 700 }}>流管理</div>
            <Input.Search
                placeholder="请输入关键字"
                onSearch={(val) => setKeyword(val)}
                style={{ marginBottom: 16 }}
                allowClear
            />

            {/* 分类 Tabs */}
            <Tabs
                activeKey={activeTab ? String(activeTab) : "all"}
                onChange={(key) => {
                    setActiveTab(key === "all" ? undefined : Number(key));
                }}
            >
                <TabPane tab="全部" key="all" />
                <TabPane tab="场景1" key="1" />
                <TabPane tab="场景2" key="2" />
            </Tabs>

            <div className="p-4">
                <InfiniteScroll
                    dataLength={data.length}
                    next={load}
                    hasMore={hasMore}
                    loader={<Spin />}
                    endMessage={<p className="text-center text-gray-500">没有更多数据了</p>}
                // scrollableTarget={null} // 🚀 使用页面滚动，不会多出一个滚动条
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.map((item) => (
                            <Card
                                key={item.id}
                                title={item.name}
                                className="shadow rounded-xl"
                            >
                                <p>类型: {item.stream_type}</p>
                                <p>路径: {item.stream_path}</p>
                                <p>场景: {item.scenario_name}</p>
                                <p>创建时间: {new Date(item.created_at * 1000).toLocaleString()}</p>
                            </Card>
                        ))}
                    </div>
                </InfiniteScroll>
            </div>
        </div>


    );
};

export default StreamManagement;