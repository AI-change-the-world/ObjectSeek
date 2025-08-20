// pages/SceneManagement.tsx
import { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Typography } from "antd";

const { Title } = Typography;

// mock 数据
interface Scene {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

const initialData: Scene[] = [
    { id: 1, name: "施工现场", description: "用于施工监控场景", createdAt: "2025-08-10" },
    { id: 2, name: "零售店", description: "用于客流统计场景", createdAt: "2025-08-15" },
];

export default function Scenario() {
    const [data, setData] = useState<Scene[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Scene | null>(null);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then(values => {
            if (editing) {
                setData(prev =>
                    prev.map(item => (item.id === editing.id ? { ...item, ...values } : item))
                );
            } else {
                const newScene: Scene = {
                    id: Date.now(),
                    ...values,
                    createdAt: new Date().toISOString().slice(0, 10),
                };
                setData(prev => [...prev, newScene]);
            }
            form.resetFields();
            setEditing(null);
            setIsModalOpen(false);
        });
    };

    const handleEdit = (record: Scene) => {
        setEditing(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setData(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div style={{ padding: "12px 24px" }}>
            <Title level={4}>场景管理</Title>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setIsModalOpen(true)}>
                新增场景
            </Button>

            <Table
                rowKey="id"
                dataSource={data}
                columns={[
                    { title: "名称", dataIndex: "name" },
                    { title: "描述", dataIndex: "description" },
                    { title: "创建时间", dataIndex: "createdAt" },
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

            <Modal
                title={editing ? "编辑场景" : "新增场景"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
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
                </Form>
            </Modal>
        </div>
    );
}


