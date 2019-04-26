export default function addShakePhone(fn, options) {
  // eslint-disable-next-line
  let { shakeThreshold, lastUpdate, x, y, z, lastX, lastY, lastZ } = {
    shakeThreshold: 1000, // 定义一个摇动的阈值
    lastUpdate: 0, // 记录上一次摇动的时间
    x: 0,
    y: 0,
    z: 0,
    lastX: 0,
    lastY: 0,
    lastZ: 0,
    ...options,
  };

  // 运动传感器处理
  function deviceMotionHandler(eventData) {
    const acceleration = eventData.accelerationIncludingGravity; // 获取含重力的加速度
    const curTime = new Date().getTime();

    // 100毫秒进行一次位置判断
    if (curTime - lastUpdate > 100) {
      const diffTime = curTime - lastUpdate;

      lastUpdate = curTime;

      x = acceleration.x;
      y = acceleration.y;
      z = acceleration.z;

      const speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;
      // 前后x, y, z间的差值的绝对值和时间比率超过了预设的阈值，则判断设备进行了摇晃操作

      if (speed > shakeThreshold) {
        fn();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    }
  }

  // 监听传感器运动事件
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
  }
}
