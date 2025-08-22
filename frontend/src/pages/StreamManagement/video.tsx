import type { StreamProps } from "./api";
import { Card, Button, Tag, Tooltip, Row } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlayCircleOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import defaultThumbnail from "../../assets/text.png";
const { Meta } = Card;

const VideoWidget = (video: StreamProps, onDelete?: () => void, onEdit?: () => void) => {
    return (
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
                                    type="text"   // 👈 使用 "text" 或 "link" 类型，这样没有边框和背景
                                    icon={<EditOutlined />}
                                    onClick={onEdit}
                                />
                            </Tooltip>

                            <Tooltip title="删除">
                                <Button
                                    type="text"
                                    danger        // 👈 删除一般加个红色
                                    icon={<DeleteOutlined />}
                                    onClick={onDelete}
                                />
                            </Tooltip>
                        </Row>

                    </div>
                }
            />
        </Card>
    );
};

export default VideoWidget;
