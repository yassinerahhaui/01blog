package com.yrcode._blog.shared;

import java.util.List;

import lombok.Getter;

@Getter
public class GlobalResponse<T> {
    /* new format response */
    public final static String SUCCESS = "success";
    public final static String ERROR = "error";

    private final String status;
    private final T data;
    private final List<ErrorItem> errors;

    public GlobalResponse(List<ErrorItem> errors) {
        this.status = ERROR;
        this.data = null;
        this.errors = errors;
    }

    public GlobalResponse(T data) {
        this.status = SUCCESS;
        this.data = data;
        this.errors = null;
    }

    public record ErrorItem(String message){}
}
