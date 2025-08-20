// mockData.ts
import type { VideoProps } from "./api";

export const mockVideos: VideoProps[] = [
    {
        id: 1,
        title: "施工现场监控",
        type: "stream",
        category: 1,
        url: "rtsp://example.com/stream1",
        thumbnail: null,
    },
    {
        id: 2,
        title: "零售店客流分析",
        type: "video",
        category: 2,
        url: "https://example.com/video.mp4",
        thumbnail: "/thumbs/store1.jpg",
    },
    {
        id: 3,
        title: "公园监控",
        type: "stream",
        category: 1,
        url: "rtsp://example.com/stream2",
        thumbnail: null,
    },
];
