local key = KEYS[1]
local value = ARGV[1]

-- 超時釋放鎖
-- 獲取鎖中標示的值，如果與當前值相同，則刪除鎖
if redis.call('get', key) == value then
    return redis.call('del', key)
else
-- 不一致，直接返回
    return 0
end