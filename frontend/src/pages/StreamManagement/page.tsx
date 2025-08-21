// 比如在您的 src/pages/MyStreamPage.tsx 或者 Layout 文件中

import React from 'react';
import StreamManagement from './StreamManagement';
import { Layout } from 'antd'; // 假设您用了 Ant Design Layout

const { Content } = Layout;

const MyStreamPage: React.FC = () => {
    return (
        // 关键1: 创建一个 flex 容器，并定义总高度。
        // 这里的 'calc(100vh - 64px)' 是假设您的应用有一个 64px 高的顶部导航栏。
        // 您需要根据实际布局调整这个高度。目标是让这个 Content 有一个明确的、占满屏幕的高度。
        <Content style={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 关键2: 让 StreamManagement 组件撑满这个 flex 容器 */}
            <StreamManagement />
        </Content>
    );
};

export default MyStreamPage;