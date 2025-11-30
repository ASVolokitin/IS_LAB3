package com.ticketis.app.exception.minio;

public class MinioException extends RuntimeException {
    
    public MinioException(String message) {
        super(message);
    }

    public MinioException() {
        super("Error ocurred while trying to run operation in MinIO");
    }
}
