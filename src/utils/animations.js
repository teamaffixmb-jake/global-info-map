export function animateCircleBounce(circle, baseRadius) {
    const bounces = [
        {radius: baseRadius * 1.5, duration: 250},
        {radius: baseRadius, duration: 250},
        {radius: baseRadius * 1.3, duration: 200},
        {radius: baseRadius, duration: 200},
        {radius: baseRadius * 1.4, duration: 200},
        {radius: baseRadius, duration: 200}
    ];
    
    let index = 0;
    function nextBounce() {
        if (index < bounces.length) {
            circle.setRadius(bounces[index].radius);
            setTimeout(nextBounce, bounces[index].duration);
            index++;
        }
    }
    nextBounce();
}

export function animateCirclePulse(circle, baseRadius) {
    let growing = true;
    let currentRadius = baseRadius;
    
    const pulseInterval = setInterval(() => {
        if (growing) {
            currentRadius += 0.3;
            if (currentRadius >= baseRadius * 1.3) growing = false;
        } else {
            currentRadius -= 0.3;
            if (currentRadius <= baseRadius) growing = true;
        }
        circle.setRadius(currentRadius);
    }, 100);
    
    // Store interval so we can clear it when markers are cleared
    circle._pulseInterval = pulseInterval;
    return pulseInterval;
}

