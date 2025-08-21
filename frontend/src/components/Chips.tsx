import React, { useState } from "react";
import { Input, Tag } from "antd";

interface FeatureChipsProps {
    value?: string; // 表单值（;分隔的字符串）
    onChange?: (val: string) => void; // 触发表单更新
}

const FeatureChips: React.FC<FeatureChipsProps> = ({ value, onChange }) => {
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // 字符串转数组
    const tags = value ? value.split(";").filter(Boolean) : [];

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            const newTags = [...tags, inputValue];
            onChange?.(newTags.join(";"));
        }
        setInputVisible(false);
        setInputValue("");
    };

    const removeTag = (removedTag: string) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        onChange?.(newTags.join(";"));
    };

    return (
        <>
            {tags.map(tag => (
                <Tag
                    key={tag}
                    closable
                    onClose={() => removeTag(tag)}
                    style={{ marginBottom: 4 }}
                >
                    {tag}
                </Tag>
            ))}
            {inputVisible ? (
                <Input
                    size="small"
                    style={{ width: 120 }}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    autoFocus
                />
            ) : (
                <Tag
                    onClick={() => setInputVisible(true)}
                    style={{ background: "#fff", borderStyle: "dashed", cursor: "pointer" }}
                >
                    + 添加特征
                </Tag>
            )}
        </>
    );
};

export default FeatureChips;
