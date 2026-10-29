import proxy from "express-http-proxy";
export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            const userId = srcReq.user?.userId || srcReq.user?.user || srcReq.user?._id;
            if (userId) {
                proxyReqOpts.headers["x-user-id"] = String(userId);
            }
            return proxyReqOpts;
        }
    });
};