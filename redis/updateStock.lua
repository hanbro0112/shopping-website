local canUpdate = true
for i = 1, #KEYS do
    local key = KEYS[i]
    local value = tonumber(ARGV[i])

    -- 查詢庫存值
    local stock = tonumber(redis.call('hget', key, 'stock'))
    if stock < value then
        canUpdate = false
        break
    end
end

if not canUpdate then
    -- 庫存不足
    return 0
else
    for i = 1, #KEYS do
        local key = KEYS[i]
        local value = tonumber(ARGV[i])
        
        -- 更新庫存值
        redis.call('hincrby', key, 'stock', -value)
    end
    return 1
end