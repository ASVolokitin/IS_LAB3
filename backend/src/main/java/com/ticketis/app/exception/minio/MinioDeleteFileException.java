package com.ticketis.app.exception.minio;

public class MinioDeleteFileException extends MinioException {

    public MinioDeleteFileException(String fileName, String bucketName) {
        super(String.format("Error ocurred while trying to delete file %s from bucket %s", fileName, bucketName));
    }

    public MinioDeleteFileException() {
        super("Error ocurred while trying to delete file");
    }
    
}
