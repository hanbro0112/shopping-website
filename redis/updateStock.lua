local key = KEYS[1]
local value = tonumber(ARGV[1])

-- 查詢庫存值
if tonumber(redis.call('hget', key, 'stock')) >= value then
    -- 扣減庫存
    redis.call('hincrby', key, 'stock', -value)
    return 1
else
    -- 庫存不足
    return 0
end