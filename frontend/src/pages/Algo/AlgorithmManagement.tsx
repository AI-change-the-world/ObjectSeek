// pages/AlgorithmManagement.tsx
import { Table, Tag, Typography } from "antd";

const { Title } = Typography;

interface Algorithm {
  id: number;
  name: string;
  description: string;
  version: string;
  status: "enabled" | "disabled";
}

const algorithms: Algorithm[] = [
  { id: 1, name: "人员检测", description: "检测视频中出现的人物", version: "v1.0", status: "enabled" },
  { id: 2, name: "车辆检测", description: "识别监控视频中的车辆", version: "v1.1", status: "enabled" },
  { id: 3, name: "人脸识别", description: "识别人脸并比对数据库", version: "v0.9-beta", status: "disabled" },
];

export default function AlgorithmManagement() {
  return (
    <div style={{ padding: "12px 24px" }}>
      <Title level={4}>算法管理</Title>

      <Table
        rowKey="id"
        dataSource={algorithms}
        columns={[
          { title: "算法名称", dataIndex: "name" },
          { title: "描述", dataIndex: "description" },
          { title: "版本", dataIndex: "version" },
          {
            title: "状态",
            dataIndex: "status",
            render: (status: "enabled" | "disabled") =>
              status === "enabled" ? (
                <Tag color="green">启用</Tag>
              ) : (
                <Tag color="red">停用</Tag>
              ),
          },
        ]}
      />
    </div>
  );
}
