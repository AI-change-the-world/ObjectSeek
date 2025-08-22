// components/ModalForm.tsx
import { useState, useEffect } from "react";
import { Modal, Form, Spin } from "antd";

interface ModalFormProps<T> {
    title: string;
    open: boolean;
    initialValues?: Partial<T>;
    formItems: React.ReactNode;
    onSubmit: (values: T) => Promise<void>;
    onCancel: () => void;
}

export default function ModalForm<T extends object>({
    title,
    open,
    initialValues,
    formItems,
    onSubmit,
    onCancel,
}: ModalFormProps<T>) {
    const [form] = Form.useForm<T>();
    const [loading, setLoading] = useState(false);

    // 关键：当 initialValues 变化时，手动更新表单
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues as T);
            } else {
                form.resetFields();
            }
        }
    }, [initialValues, open, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onSubmit(values);
            form.resetFields();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            onCancel={() => {
                if (!loading) {
                    onCancel();
                    form.resetFields();
                }
            }}
            confirmLoading={loading}
            maskClosable={!loading}
            closable={!loading}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical">
                    {formItems}
                </Form>
            </Spin>
        </Modal>
    );
}




