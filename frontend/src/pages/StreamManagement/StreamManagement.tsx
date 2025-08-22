import React, { useEffect, useState, useCallback } from "react";
import { Spin, Tabs, Button, Row, Form, Modal, Input, Upload } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchCatalog, fetchData, type CatalogProps, type StreamProps } from "./api";
import TabPane from "antd/es/tabs/TabPane";
import VideoWidget from "./video";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";


const StreamPathInput: React.FC<{
    value: string;
    onChange: (v: string) => void;
}> = React.memo(({ value, onChange }) => {
    return (
        <Input
            value={value}
            placeholder="请输入 RTSP 地址或上传视频文件"
            style={{ flex: 1 }}
            onChange={(e) => onChange(e.target.value)}
        />
    );
});

const StreamManagement: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [data, setData] = useState<StreamProps[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [_, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tabs, setTabs] = useState<CatalogProps[]>([]);

    // State for filters
    const [activeTab, setActiveTab] = useState<number>(0);
    // const [keyword, setKeyword] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [pathVal, setPathVal] = useState("");

    // --- DATA FETCHING LOGIC ---


    const handleBeforeUpload = async (file: File) => {
        try {
            setUploading(true);

            setTimeout(() => {
                setPathVal(file.name);
                console.log("设置 stream_path 为:", file.name);
            }, 0);

            toast.success("上传成功");
        } catch (err) {
            toast.error((err as Error).message || "上传失败");
        } finally {
            setUploading(false);
        }

        return false; // 阻止 antd 自动上传
    };

    useEffect(() => {
        const init = async () => {
            const res = await fetchCatalog();
            if (!res) return;
            setTabs(res);
            // 默认选第一个 tab
            if (res.length > 0) {
                setActiveTab(res[0].scenario_id);
            }
        };
        init();
    }, []); // 注意：空依赖数组 -> 只在挂载时执行

    // useCallback is used to memoize the function, preventing unnecessary re-creation.
    const loadData = useCallback(async (currentPage: number, currentTab?: number) => {
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
        loadData(1, activeTab);
    }, [activeTab]);

    // Effect for loading more data when page number changes (due to infinite scroll)
    useEffect(() => {
        // We only fetch if the page is > 1. Page 1 is handled by the filter effect.
        if (page > 1) {
            loadData(page, activeTab);
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



    const handleTabChange = (key: string) => {
        // Set active tab. The useEffect for filters will handle the rest.
        setActiveTab(Number(key));
    };



    return (
        // **FIXED**: Add an ID to the main scrollable container.
        <div id="scrollableDiv" style={{ padding: "12px 24px", height: "calc(100vh - 50px)", overflow: "auto" }}>
            <div style={{ marginBottom: 16, fontWeight: 700 }}>流管理</div>
            {/* <Input.Search
                placeholder="请输入关键字"
                onSearch={handleSearch}
                style={{ marginBottom: 16 }}
                allowClear
            /> */}
            <Row>
                <div style={{ flex: 1 }}></div>
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => {
                        setModalOpen(true);
                    }}
                >
                    新增视频
                </Button>
            </Row>

            <Tabs
                activeKey={String(activeTab)}
                onChange={handleTabChange}
            >
                {/* <TabPane tab="全部" key="all" />
                <TabPane tab="场景1" key="1" />
                <TabPane tab="场景2" key="2" /> */}
                {tabs.map((tab) => (
                    <TabPane tab={tab.scenario_name} key={String(tab.scenario_id)} />
                ))}
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

                            VideoWidget(item)
                        ))}
                    </div>
                </InfiniteScroll>
            </div>

            <Modal
                title={"新增视频"}
                open={modalOpen}
                onOk={() => { }}
                onCancel={() => {
                    setModalOpen(false);
                }}
                confirmLoading={loading}
                maskClosable={!loading}
                closable={!loading}

            >

                <Form.Item
                    name="name"
                    label="流名称"
                    rules={[{ required: true, message: "请输入流名称" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="stream_path"
                    label="流地址"
                    rules={[{ required: true, message: "请上传或者输入流地址" }]}
                >
                    <Row gutter={8} style={{ display: "flex", marginRight: 1.5 }}>
                        <StreamPathInput value={pathVal} onChange={(e) => setPathVal(e)} />

                        {/* 上传按钮 */}
                        <Upload
                            style={{ marginLeft: 8 }}
                            accept="video/*"
                            showUploadList={false}
                            beforeUpload={handleBeforeUpload}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
                                上传视频
                            </Button>
                        </Upload>
                    </Row>
                </Form.Item>

                <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} />
                </Form.Item>


            </Modal>
        </div >
    );
};

export default StreamManagement;