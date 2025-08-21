// pages/SceneManagement.tsx
import { useEffect, useState } from "react";
import { Table, Button, Form, Input, Space, Popconfirm, Row, Spin, message, Tag, Tooltip } from "antd";
import { getScenarioList, createScenario, updateScenario, deleteScenario, type ScenarioProps, UpdateScenarioProps, CreateScenarioProps } from "./api";
import { PaginatedRequest } from "../../api/response";
import ModalForm from "../../components/ModelForm";
import FeatureChips from "../../components/Chips";

export default function Scenario() {
    const [data, setData] = useState<ScenarioProps[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<ScenarioProps | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const fetchScenario = async (pageNo = page, size = pageSize) => {
        try {
            setLoading(true);
            const params = new PaginatedRequest(pageNo, size);
            const res = await getScenarioList(params);
            if (res?.data) {
                setData(res.data.records ?? []);
                setTotal(res.data.total ?? 0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScenario(page, pageSize);
    }, [page, pageSize]);


    const handleEdit = (record: ScenarioProps) => {
        setEditing(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteScenario(id);
            message.success("删除成功");
            // 重新加载列表
            fetchScenario();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "12px 24px" }}>
            <div style={{ marginBottom: 16, fontWeight: 700 }}>场景管理</div>

            <Row>
                <div style={{ flex: 1 }}></div>
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => {
                        setEditing(null);
                        setIsModalOpen(true);
                        form.resetFields();
                    }}
                >
                    新增场景
                </Button>
            </Row>

            <Spin spinning={loading}>
                <Table
                    rowKey="id"
                    dataSource={data}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        onChange: (p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        },
                    }}
                    columns={[
                        { title: "编号", dataIndex: "id" },
                        { title: "名称", dataIndex: "name" },
                        { title: "描述", dataIndex: "description" },
                        {
                            title: "特征",
                            dataIndex: "keypoints",
                            render: (keypoints: string) => {
                                if (!keypoints || keypoints.length === 0) return "-";
                                const keypointsArray = keypoints.split(";");
                                const display = keypointsArray.slice(0, 3);
                                const hidden = keypointsArray.length > 3 ? keypointsArray.slice(3) : [];

                                return (
                                    <>
                                        {display.map((item, index) => (
                                            <Tag key={index}>{item}</Tag>
                                        ))}
                                        {hidden.length > 0 && (
                                            <Tooltip title={hidden.join(", ")}>
                                                <Tag>+{hidden.length} 更多</Tag>
                                            </Tooltip>
                                        )}
                                    </>
                                );
                            },
                        },
                        {
                            title: "创建时间",
                            dataIndex: "created_at",
                            render: (time) => new Date(time * 1000).toLocaleString(),
                        },
                        {
                            title: "操作",
                            render: (_, record) => (
                                <Space>
                                    <Button type="link" onClick={() => handleEdit(record)}>
                                        编辑
                                    </Button>
                                    <Popconfirm
                                        title="确定删除该场景吗？"
                                        onConfirm={() => handleDelete(record.id)}
                                    >
                                        <Button type="link" danger>
                                            删除
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                />
            </Spin>


            <ModalForm<ScenarioProps>
                title={editing ? "编辑场景" : "新增场景"}
                open={isModalOpen}
                initialValues={editing || {}}
                onSubmit={async (values) => {
                    if (editing) {
                        // 修改场景
                        const u = new UpdateScenarioProps(editing.id, values.name, values.description, values.keypoints);
                        await updateScenario(u);
                        message.success("修改成功");
                    } else {
                        // 新建场景
                        const c = new CreateScenarioProps(values.name, values.description, values.keypoints);
                        await createScenario(c);
                        message.success("创建成功");
                    }
                    setIsModalOpen(false);
                    setEditing(null);
                    fetchScenario();
                }}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                }}
                formItems={
                    <>
                        <Form.Item
                            name="name"
                            label="名称"
                            rules={[{ required: true, message: "请输入场景名称" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="描述">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item name="keypoints" label="特征">
                            <FeatureChips />
                        </Form.Item>
                    </>
                }
            />
        </div>
    );
}
