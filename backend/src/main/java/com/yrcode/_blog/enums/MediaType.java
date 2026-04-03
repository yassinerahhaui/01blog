package com.yrcode._blog.enums;

public enum MediaType {
    EMPTY,
    IMAGE,
    VIDEO;

    public static MediaType fromString(String mimeType) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            return EMPTY;
        }
        
        if (mimeType.toLowerCase().startsWith("image/")) {
            return IMAGE;
        }
        
        if (mimeType.toLowerCase().startsWith("video/")) {
            return VIDEO;
        }
        
        return EMPTY;
    }
}
