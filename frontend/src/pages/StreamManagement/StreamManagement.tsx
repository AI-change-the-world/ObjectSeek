import React, { useEffect, useState, useCallback } from "react";
import { Card, Spin, Input, Tabs } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchData, type StreamProps } from "./api";
import TabPane from "antd/es/tabs/TabPane";

const StreamManagement: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [data, setData] = useState<StreamProps[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [_, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // State for filters
    const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
    const [keyword, setKeyword] = useState("");

    // --- DATA FETCHING LOGIC ---

    // useCallback is used to memoize the function, preventing unnecessary re-creation.
    const loadData = useCallback(async (currentPage: number, _: string, currentTab?: number) => {
        if (loading) return;
        setLoading(true);

        // Fetch data using the provided arguments, not just state. This makes the function more predictable.
        const res = await fetchData(currentPage, 10, currentTab ?? 0);

        if (res) {
            // **FIXED**: If it's the first page, we REPLACE the data. Otherwise, we APPEND it.
            setData((prev) => (currentPage === 1 ? res.records : [...prev, ...res.records]));
            setTotal(res.total);

            // **FIXED**: Calculate hasMore based on the total potential data length.
            const newTotalData = currentPage === 1 ? res.records.length : data.length + res.records.length;
            setHasMore(newTotalData < res.total);
        }

        setLoading(false);
    }, [data.length, loading]); // Dependency on data.length helps in hasMore calculation.

    // --- EFFECTS ---

    // Effect for handling filter changes (tab or keyword)
    useEffect(() => {
        // **FIXED**: When filters change, reset page to 1 and trigger a new data fetch.
        setPage(1);
        setData([]); // Clear data immediately for better UX
        setHasMore(true); // Assume new filter has data
        loadData(1, keyword, activeTab);
    }, [activeTab, keyword]);

    // Effect for loading more data when page number changes (due to infinite scroll)
    useEffect(() => {
        // We only fetch if the page is > 1. Page 1 is handled by the filter effect.
        if (page > 1) {
            loadData(page, keyword, activeTab);
        }
    }, [page]);


    // --- HANDLERS ---

    const handleLoadMore = () => {
        // This is called by InfiniteScroll. It just needs to increment the page.
        // The useEffect watching `page` will then trigger the data fetch.
        if (!loading) {
            setPage((prev) => prev + 1);
        }
    };

    const handleSearch = (value: string) => {
        // Set keyword. The useEffect for filters will handle the rest.
        setKeyword(value);
    };

    const handleTabChange = (key: string) => {
        // Set active tab. The useEffect for filters will handle the rest.
        setActiveTab(key === "all" ? undefined : Number(key));
    };


    return (
        // **FIXED**: Add an ID to the main scrollable container.
        <div id="scrollableDiv" style={{ padding: "12px 24px", height: "calc(100vh - 50px)", overflow: "auto" }}>
            <div style={{ marginBottom: 16, fontWeight: 700 }}>流管理</div>
            <Input.Search
                placeholder="请输入关键字"
                onSearch={handleSearch}
                style={{ marginBottom: 16 }}
                allowClear
            />

            <Tabs
                activeKey={activeTab ? String(activeTab) : "all"}
                onChange={handleTabChange}
            >
                <TabPane tab="全部" key="all" />
                <TabPane tab="场景1" key="1" />
                <TabPane tab="场景2" key="2" />
            </Tabs>

            <div className="p-4">
                <InfiniteScroll
                    dataLength={data.length}
                    next={handleLoadMore}
                    hasMore={hasMore}
                    loader={<div className="text-center py-4"><Spin /></div>}
                    endMessage={<p style={{ textAlign: 'center', color: '#888' }}>没有更多数据了</p>}
                    // **FIXED**: Point the component to the correct scrollable element.
                    scrollableTarget="scrollableDiv"
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