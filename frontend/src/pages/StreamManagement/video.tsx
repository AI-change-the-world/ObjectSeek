import type { VideoProps } from "./api";
import { Card, Button, Tag, Tooltip } from "antd";
import {
    PlayCircleOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import defaultThumbnail from "../../assets/react.svg";
const { Meta } = Card;

const VideoWidget = (video: VideoProps) => {
    return (
        <Card
            key={video.id}
            hoverable
            cover={
                <div style={{ position: "relative" }}>
                    <img
                        src={video.thumbnail || defaultThumbnail}
                        alt={video.title}
                        style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
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
                            />
                        </Tooltip>
                    </div>
                    {/* 实时流标记 */}
                    {video.type === "stream" && (
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
                    <Tooltip title={video.title}>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                            {video.title}
                        </span>
                    </Tooltip>
                }
                description={
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                color: "rgba(0,0,0,0.45)",
                                marginBottom: 4,
                            }}
                        >
                            <VideoCameraOutlined style={{ marginRight: 4 }} />
                            {video.type === "video" ? "视频文件" : "视频流"}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default VideoWidget;
