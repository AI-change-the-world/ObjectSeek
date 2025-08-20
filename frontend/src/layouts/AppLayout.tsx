import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import defaultThumbnail from "../assets/icon.svg";

const { Header, Sider, Content } = Layout;

export default function AppLayout() {


    const navigate = useNavigate();
    const location = useLocation();

    // 根据当前路径确定选中的菜单项
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/monitor')) return 'monitor';
        if (path.includes('/stream-management')) return 'stream';
        if (path.includes('/scenario-management')) return 'scenario';
        if (path.includes('/algorithm-management')) return 'algorithm';
        return 'dashboard'; // 默认选中项
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    background: '#fff',
                    padding: '0 16px',
                    height: '30px',
                    lineHeight: '30px',
                    fontSize: '14px',
                    display: 'flex',         // 使用 flex 布局
                    alignItems: 'center',    // 垂直居中
                }}
            >
                <img
                    src={defaultThumbnail}  // 图片路径，可以是本地 public 文件夹下的路径或网络图片
                    alt="Logo"
                    style={{ height: '20px', marginRight: '8px' }} // 高度控制，右边留点空隙
                />
                ObjectSeek
            </Header>
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <Menu
                        mode="inline"
                        // defaultSelectedKeys={['org']}
                        selectedKeys={[getSelectedKey()]}
                        style={{ height: '100%' }}
                        items={[
                            { key: 'dashboard', label: '仪表盘', onClick: () => navigate('/dashboard') },
                            { key: 'monitor', label: '系统监控', onClick: () => navigate('/monitor') },
                            { key: 'scenario', label: '场景管理', onClick: () => navigate('/scenario-management') },
                            { key: 'algorithm', label: '算法管理', onClick: () => navigate('/algorithm-management') },
                            { key: 'stream', label: '流管理', onClick: () => navigate('/stream-management') },
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