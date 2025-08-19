import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    background: '#fff',
                    padding: '0 16px', // 左右间距
                    height: '30px',
                    lineHeight: '30px', // 和 Header 高度一致，文字垂直居中
                    fontSize: '14px',   // 可根据需要调整
                }}
            >
                ObjectSeek
            </Header>
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['org']}
                        style={{ height: '100%' }}
                        items={[
                            { key: 'dashboard', label: '仪表盘', onClick: () => navigate('/dashboard') },
                            { key: 'monitor', label: '系统监控', onClick: () => navigate('/monitor') },
                            // { key: 'org', label: '组织管理', onClick: () => navigate('/org') },
                            // { key: 'user', label: '用户管理', onClick: () => navigate('/user') },
                            // { key: 'knowledge', label: '知识库管理', onClick: () => navigate('/knowledge') },
                            // { key: 'documents', label: '文档管理', onClick: () => navigate('/documents') },
                        ]}
                    />
                </Sider>
                <Content style={{ background: '#f5f5f5', padding: 0, flex: 1 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}