package com.genersoft.iot.vmp.streamPush.controller;

import com.genersoft.iot.vmp.conf.security.JwtUtils;
import com.genersoft.iot.vmp.conf.exception.ControllerException;
import com.genersoft.iot.vmp.gb28181.transmit.callback.DeferredResultHolder;
import com.genersoft.iot.vmp.gb28181.transmit.callback.RequestMessage;
import com.genersoft.iot.vmp.media.bean.MediaServer;
import com.genersoft.iot.vmp.media.service.IMediaServerService;
import com.genersoft.iot.vmp.streamPush.bean.StreamPush;
import com.genersoft.iot.vmp.streamPush.service.IStreamPushService;
import com.genersoft.iot.vmp.utils.DateUtil;
import com.genersoft.iot.vmp.vmanager.bean.ErrorCode;
import com.genersoft.iot.vmp.vmanager.bean.WVPResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.UUID;

/**
 * 推流设备截图相关API
 */
@Tag(name = "推流设备截图", description = "")
@RestController
@Slf4j
@RequestMapping(value = "/api/push")
public class StreamPushSnapshotController {

    @Autowired
    private IMediaServerService mediaServerService;

    @Autowired
    private IStreamPushService streamPushService;

    @Autowired
    private DeferredResultHolder resultHolder;

    /**
     * 获取截图
     */
    @Operation(summary = "获取推流设备截图", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "app", description = "应用名", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @GetMapping("/snap")
    public DeferredResult<String> getSnap(String app, String stream) {
        if (log.isDebugEnabled()) {
            log.debug("获取推流设备截图: {}/{}", app, stream);
        }

        DeferredResult<String> result = new DeferredResult<>(3 * 1000L);
        String key = DeferredResultHolder.CALLBACK_CMD_PUSH_SNAP + app + "_" + stream;
        String uuid = UUID.randomUUID().toString();
        resultHolder.put(key, uuid, result);

        RequestMessage message = new RequestMessage();
        message.setKey(key);
        message.setId(uuid);

        StreamPush streamPush = streamPushService.getPush(app, stream);
        if (streamPush == null) {
            message.setData(WVPResult.fail(ErrorCode.ERROR404.getCode(), "推流设备未找到"));
            resultHolder.invokeResult(message);
            return result;
        }

        MediaServer mediaServer = mediaServerService.getOne(streamPush.getMediaServerId());
        if (mediaServer == null) {
            message.setData(WVPResult.fail(ErrorCode.ERROR100.getCode(), "流媒体未找到"));
            resultHolder.invokeResult(message);
            return result;
        }

//        String streamUrl;
//        if (mediaServer.getRtspPort() != 0) {
//            streamUrl = String.format("rtsp://127.0.0.1:%s/%s/%s", mediaServer.getRtspPort(), app, stream);
//        } else {
//            streamUrl = String.format("http://127.0.0.1:%s/%s/%s.live.mp4", mediaServer.getHttpPort(), app, stream);
//        }
        String path = "snap";
        String fileName = app + "_" + stream + "_" + DateUtil.getNowForUrl() + ".jpg";
        // String fileName = app + "_" + stream + ".jpg";
        
        // 请求截图
        log.info("[请求推流设备截图]: " + fileName);
        mediaServerService.getSnap(mediaServer, app, stream, 15, 1, path, fileName);
        
        File snapFile = new File(path + File.separator + fileName);
        if (snapFile.exists()) {
            message.setData(snapFile.getAbsoluteFile());
        } else {
            message.setData(WVPResult.fail(ErrorCode.ERROR100.getCode(), "获取截图失败"));
        }
        resultHolder.invokeResult(message);
        
        return result;
    }

    /**
     * 请求截图
     */
    @GetMapping("/getsnap/{app}/{stream}")
    @Operation(summary = "推流设备请求截图")
    @Parameter(name = "app", description = "应用名", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @Parameter(name = "mark", description = "标识", required = false)
    public void getSnap(HttpServletResponse resp, @PathVariable String app, @PathVariable String stream, @RequestParam(required = false) String mark) {
        try {
            final InputStream in = Files.newInputStream(new File("snap" + File.separator + app + "_" + stream + (mark == null ? ".jpg" : ("_" + mark + ".jpg"))).toPath());
            resp.setContentType(MediaType.IMAGE_PNG_VALUE);
            ServletOutputStream outputStream = resp.getOutputStream();
            IOUtils.copy(in, resp.getOutputStream());
            in.close();
            outputStream.close();
        } catch (IOException e) {
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }
    }
}