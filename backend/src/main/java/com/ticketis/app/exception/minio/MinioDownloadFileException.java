package com.ticketis.app.exception.minio;

public class MinioDownloadFileException extends MinioException {

    public MinioDownloadFileException(String fileName, String bucketName) {
        super(String.format("Error ocurred while trying to download file %s from bucket %s", fileName, bucketName));
    }

    public MinioDownloadFileException() {
        super("Error ocurred while trying to download file");
    }
    
}
