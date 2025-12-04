package com.ticketis.app.config;

import org.apache.kafka.connect.runtime.WorkerConfig;
import org.apache.kafka.connect.storage.OffsetBackingStore;

import java.nio.ByteBuffer;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;


public class MemoryOffsetBackingStore implements OffsetBackingStore {
    
    private final Map<ByteBuffer, ByteBuffer> data = new ConcurrentHashMap<>();
    
    @Override
    public void start() {}
    
    @Override
    public void stop() {
        data.clear();
    }
    
    @Override
    public Future<Map<ByteBuffer, ByteBuffer>> get(Collection<ByteBuffer> keys) {
        Map<ByteBuffer, ByteBuffer> result = new HashMap<>();
        for (ByteBuffer key : keys) {
            ByteBuffer value = data.get(key);
            if (value != null) {
                ByteBuffer keyCopy = ByteBuffer.allocate(key.remaining());
                ByteBuffer valueCopy = ByteBuffer.allocate(value.remaining());
                keyCopy.put(key.duplicate());
                valueCopy.put(value.duplicate());
                keyCopy.flip();
                valueCopy.flip();
                result.put(keyCopy, valueCopy);
            }
        }
        return java.util.concurrent.CompletableFuture.completedFuture(result);
    }
    
    @Override
    public Future<Void> set(Map<ByteBuffer, ByteBuffer> values, org.apache.kafka.connect.util.Callback<Void> callback) {
        for (Map.Entry<ByteBuffer, ByteBuffer> entry : values.entrySet()) {
            ByteBuffer keyCopy = ByteBuffer.allocate(entry.getKey().remaining());
            ByteBuffer valueCopy = ByteBuffer.allocate(entry.getValue().remaining());
            keyCopy.put(entry.getKey().duplicate());
            valueCopy.put(entry.getValue().duplicate());
            keyCopy.flip();
            valueCopy.flip();
            data.put(keyCopy, valueCopy);
        }
        if (callback != null) {
            callback.onCompletion(null, null);
        }
        return java.util.concurrent.CompletableFuture.completedFuture(null);
    }
    
    @Override
    public void configure(WorkerConfig config) {}
    
    @Override
    public Set<Map<String, Object>> connectorPartitions(String connectorName) {
        return java.util.Collections.emptySet();
    }
}
