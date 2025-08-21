// pages/AlgorithmManagement.tsx
import { Spin, Table, Tag } from "antd";
import { getAlgorithmList, type AlgorithmProps } from "./api";
import { useEffect, useState } from "react";
import { PaginatedRequest } from "../../api/response";


export default function AlgorithmManagement() {
  const [algorithms, setAlgorithms] = useState<AlgorithmProps[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchAlgorithms = async (pageNo = 1, size = 10) => {
    try {
      setLoading(true);
      const params = new PaginatedRequest(pageNo, size);
      const res = await getAlgorithmList(params);

      if (res?.records) {
        setAlgorithms(res.records ?? []);
        setTotal(res.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlgorithms(page, pageSize);
  }, [page, pageSize]);

  return (
    <div style={{ padding: "12px 24px" }}>
      {/* <Title level={4}>算法管理</Title> */}
      <div style={{ marginBottom: 16, fontWeight: 700 }}>算法管理</div>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={algorithms}
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
            { title: "算法名称", dataIndex: "name" },
            { title: "描述", dataIndex: "description" },
            { title: "版本", dataIndex: "version" },
            { title: "创建时间", dataIndex: "created_at", render: (time) => new Date(time * 1000).toLocaleString() },
            {
              title: "状态",
              dataIndex: "is_deleted",
              render: (status: 0 | 1 | undefined) =>
                status === 0 ? (
                  <Tag color="green">启用</Tag>
                ) : (
                  <Tag color="red">停用</Tag>
                ),
            },
          ]}
        />
      </Spin>
    </div>
  );
}