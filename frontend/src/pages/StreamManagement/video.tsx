import React, { useState, useRef } from "react";
import type { StreamProps } from "./api";
import { Card, Button, Tag, Tooltip, Row, Modal, Spin } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlayCircleOutlined,
    VideoCameraOutlined,
    FullscreenOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import defaultThumbnail from "../../assets/text.png";
import { fetchStreamView } from "./api";
import { toast } from "react-toastify";

const { Meta } = Card;

const VideoWidget: React.FC<{
    video: StreamProps;
    onDelete?: () => void;
    onEdit?: () => void;
}> = ({ video, onDelete, onEdit }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [streamUrl, setStreamUrl] = useState<string>("");
    const [videoError, setVideoError] = useState<string>("");
    const videoRef = useRef<HTMLVideoElement>(null);



    // 检查视频是否可访问
    const checkVideoAccessibility = async (url: string): Promise<boolean> => {
        try {
            // 对于MinIO预签名URL，使用HEAD请求检查可访问性
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'cors'
            });
            console.log('视频可访问性检查:', response.status, response.statusText);
            console.log('响应头:', Object.fromEntries(response.headers.entries()));
            return response.ok;
        } catch (error) {
            console.warn('无法检查视频可访问性:', error);
            return true; // 假设可访问，让video元素来处理
        }
    };



    // 处理视频播放
    const handlePlay = async () => {
        try {
            setLoading(true);
            setVideoError("");
            console.log('请求播放视频:', video.id);

            const result = await fetchStreamView(video.id);

            if (result) {
                let videoUrl = result;
                console.log('最终使用URL:', videoUrl);


                // 检查视频可访问性
                const isAccessible = await checkVideoAccessibility(videoUrl);
                if (!isAccessible) {
                    console.warn('视频URL可能不可访问，但仍尝试播放');
                    toast.warning('视频可能需要一些时间加载');
                }

                setStreamUrl(videoUrl);
                setIsPlaying(true);
                console.log('开始播放视频');
            } else {
                throw new Error('无效的视频响应');
            }
        } catch (error) {
            console.error('播放视频失败:', error);
            const errorMsg = (error as Error).message;
            setVideoError(errorMsg);
            toast.error(`播放失败: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    // 关闭播放器
    const handleClosePlayer = () => {
        setIsPlaying(false);
        setStreamUrl("");
        setVideoError("");
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // 全屏播放
    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <>
            <Card
                key={video.id}
                hoverable
                cover={
                    <div style={{ position: "relative" }}>
                        <img
                            src={defaultThumbnail}
                            alt={video.name}
                            style={{
                                width: "100%",
                                height: 180,
                                objectFit: "contain",
                            }}
                        />
                        {/* hover 播放按钮 */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.3)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                opacity: 0,
                                transition: "opacity 0.3s",
                            }}
                            className="video-hover-overlay"
                        >
                            <Tooltip title="播放">
                                <Button
                                    shape="circle"
                                    icon={<PlayCircleOutlined />}
                                    size="large"
                                    loading={loading}
                                    onClick={handlePlay}
                                />
                            </Tooltip>
                        </div>
                        {/* 实时流标记 */}
                        {video.stream_type === "stream" && (
                            <Tag
                                color="red"
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    fontSize: 12,
                                }}
                            >
                                实时流
                            </Tag>
                        )}
                    </div>
                }
                onMouseEnter={(e) => {
                    const overlay = (e.currentTarget.querySelector(
                        ".video-hover-overlay"
                    ) as HTMLElement)!;
                    overlay.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                    const overlay = (e.currentTarget.querySelector(
                        ".video-hover-overlay"
                    ) as HTMLElement)!;
                    overlay.style.opacity = "0";
                }}
            >
                <Meta
                    title={
                        <Tooltip title={video.description}>
                            <span style={{ fontSize: 16, fontWeight: 500 }}>
                                {video.name}
                            </span>
                        </Tooltip>
                    }
                    description={
                        <div>
                            <Row>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "rgba(0,0,0,0.45)",
                                        marginBottom: 4,
                                    }}
                                >
                                    <VideoCameraOutlined style={{ marginRight: 4 }} />
                                    {video.stream_type === "file" ? "视频文件" : "视频流"}
                                </div>
                                <div
                                    style={{
                                        flex: 1
                                    }}
                                >
                                </div>
                                <Tooltip title="编辑">
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={onEdit}
                                    />
                                </Tooltip>

                                <Tooltip title="删除">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={onDelete}
                                    />
                                </Tooltip>
                            </Row>
                        </div>
                    }
                />
            </Card>

            {/* 视频播放弹窗 */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{video.name}</span>
                        <div>
                            <Tooltip title="全屏">
                                <Button
                                    type="text"
                                    icon={<FullscreenOutlined />}
                                    onClick={handleFullscreen}
                                    style={{ marginRight: 8 }}
                                />
                            </Tooltip>
                            <Tooltip title="关闭">
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={handleClosePlayer}
                                />
                            </Tooltip>
                        </div>
                    </div>
                }
                open={isPlaying}
                onCancel={handleClosePlayer}
                footer={null}
                width="90vw"
                style={{
                    top: 20,
                    maxWidth: 1400,
                }}
                bodyStyle={{
                    padding: 0,
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                destroyOnClose
                maskClosable={false}
                closable={false}
            >
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#000'
                }}>
                    {/* 视频播放区域 */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px'
                    }}>
                        {streamUrl ? (
                            <div style={{ width: '100%', position: 'relative' }}>
                                <video
                                    ref={videoRef}
                                    src={streamUrl}
                                    controls
                                    preload="metadata"
                                    autoPlay
                                    muted // 添加muted属性以符合浏览器自动播放策略
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '60vh',
                                        backgroundColor: '#000',
                                    }}
                                    onLoadStart={() => {
                                        console.log('开始加载视频:', streamUrl);
                                        setVideoError("");
                                    }}
                                    onLoadedMetadata={() => {
                                        console.log('视频元数据加载完成，时长:', videoRef.current?.duration);
                                        console.log('视频尺寸:', {
                                            width: videoRef.current?.videoWidth,
                                            height: videoRef.current?.videoHeight
                                        });
                                    }}
                                    onCanPlay={() => {
                                        console.log('视频可以播放');
                                        setVideoError("");
                                        // 自动播放（已经有autoPlay属性）
                                        if (videoRef.current && videoRef.current.paused) {
                                            videoRef.current.play().catch(err => {
                                                console.error('播放失败:', err);
                                                // 去掉静音再试一次
                                                if (videoRef.current) {
                                                    videoRef.current.muted = false;
                                                    videoRef.current.play().catch(() => {
                                                        toast.info('请点击播放按钮开始观看');
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    onPlay={() => {
                                        console.log('视频开始播放');
                                        // 播放开始后可以去掉静音
                                        if (videoRef.current) {
                                            videoRef.current.muted = false;
                                        }
                                    }}
                                    onError={(e) => {
                                        const videoElement = e.target as HTMLVideoElement;
                                        const error = videoElement.error;
                                        let errorMsg = '视频加载失败';

                                        if (error) {
                                            switch (error.code) {
                                                case error.MEDIA_ERR_ABORTED:
                                                    errorMsg = '视频加载被中断';
                                                    break;
                                                case error.MEDIA_ERR_NETWORK:
                                                    errorMsg = '网络错误，无法加载视频';
                                                    break;
                                                case error.MEDIA_ERR_DECODE:
                                                    errorMsg = '视频解码失败';
                                                    break;
                                                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                                    errorMsg = '不支持的视频格式或源';
                                                    break;
                                                default:
                                                    errorMsg = `未知错误 (${error.code})`;
                                            }
                                        }

                                        console.error('视频播放错误:', errorMsg, 'URL:', streamUrl);
                                        setVideoError(errorMsg);
                                        toast.error(`${errorMsg}`);
                                    }}
                                    onStalled={() => {
                                        console.warn('视频加载停滞');
                                    }}
                                    onWaiting={() => {
                                        console.log('视频缓冲中...');
                                    }}
                                />

                                {/* 错误时显示下载链接 */}
                                {videoError && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0,0,0,0.8)',
                                        color: 'white',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        zIndex: 10
                                    }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div>视频无法在浏览器中播放</div>
                                            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
                                                {videoError}
                                            </div>
                                        </div>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = streamUrl;
                                                link.download = video.name || 'video';
                                                link.target = '_blank';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                toast.success('已开始下载视频');
                                            }}
                                        >
                                            下载视频文件
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Spin size="large" tip="加载中..." />
                        )}
                    </div>

                    {/* 功能区域 - 为后续识别、检索功能预留 */}
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid #f0f0f0',
                        background: '#fafafa',
                        minHeight: '120px',
                        display: 'flex',
                        gap: '16px'
                    }}>
                        {/* 左侧信息区 */}
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>视频信息</h4>
                            <div style={{ fontSize: '12px', color: '#666', lineHeight: '20px' }}>
                                <div>类型: {video.stream_type === 'file' ? '视频文件' : '实时流'}</div>
                                <div>场景: {video.scenario_name || '未分类'}</div>
                                {video.description && <div>描述: {video.description}</div>}
                            </div>
                        </div>

                        {/* 右侧功能区 - 为后续识别、检索功能预留 */}
                        <div style={{ width: '300px', padding: '0 16px', borderLeft: '1px solid #e8e8e8' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>智能分析</h4>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                识别和检索功能将在后续版本中支持...
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default VideoWidget;