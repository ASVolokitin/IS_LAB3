package com.ticketis.app.exception.minio;

public class MinioUploadFileException extends MinioException {
    
    public MinioUploadFileException(String fileName, String bucketName) {
        super(String.format("Error ocurred while trying to upload file %s to bucket %s", fileName, bucketName));
    }

    public MinioUploadFileException() {
        super("Error ocurred while trying to upload file");
    }

}
