package com.genersoft.iot.vmp.gb28181.controller;

import com.genersoft.iot.vmp.common.StreamInfo;
import com.genersoft.iot.vmp.conf.UserSetting;
import com.genersoft.iot.vmp.conf.exception.ControllerException;
import com.genersoft.iot.vmp.conf.security.JwtUtils;
import com.genersoft.iot.vmp.gb28181.bean.*;
import com.genersoft.iot.vmp.gb28181.controller.bean.*;
import com.genersoft.iot.vmp.gb28181.service.IGbChannelPlayService;
import com.genersoft.iot.vmp.gb28181.service.IGbChannelService;
import com.genersoft.iot.vmp.gb28181.utils.VectorTileCatch;
import com.genersoft.iot.vmp.gb28181.service.IPlayService;
import com.genersoft.iot.vmp.gb28181.transmit.callback.DeferredResultHolder;
import com.genersoft.iot.vmp.media.bean.MediaServer;
import com.genersoft.iot.vmp.media.service.IMediaServerService;
import com.genersoft.iot.vmp.service.bean.ErrorCallback;
import com.genersoft.iot.vmp.service.bean.InviteErrorCode;
import com.genersoft.iot.vmp.utils.DateUtil;
import com.genersoft.iot.vmp.vmanager.bean.ErrorCode;
import com.genersoft.iot.vmp.streamProxy.bean.StreamProxy;
import com.genersoft.iot.vmp.streamProxy.service.IStreamProxyService;
import com.genersoft.iot.vmp.streamPush.bean.StreamPush;
import com.genersoft.iot.vmp.streamPush.service.IStreamPushService;
import com.genersoft.iot.vmp.vmanager.bean.StreamContent;
import com.genersoft.iot.vmp.vmanager.bean.WVPResult;
import com.github.pagehelper.PageInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import com.genersoft.iot.vmp.gb28181.transmit.callback.RequestMessage;
import com.genersoft.iot.vmp.utils.DateUtil;
import com.genersoft.iot.vmp.vmanager.bean.ErrorCode;
import org.apache.commons.compress.utils.IOUtils;

import java.beans.PropertyDescriptor;
import jakarta.servlet.ServletOutputStream;
//import javax.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.UUID;


@Tag(name  = "全局通道管理")
@RestController
@Slf4j
@RequestMapping(value = "/api/common/channel")
public class ChannelController {

    @Autowired
    private RedisTemplate<Object, Object> redisTemplate;

    @Autowired
    private IGbChannelService channelService;

    @Autowired
    private IMediaServerService mediaServerService;

    @Autowired
    private IGbChannelPlayService channelPlayService;


    @Autowired
    private IStreamPushService streamPushService;

    @Autowired
    private IStreamProxyService streamProxyService;

    @Autowired
    private DeferredResultHolder resultHolder;

    @Autowired
    private IPlayService playService;

    @Autowired
    private UserSetting userSetting;

    @Autowired
    private VectorTileCatch vectorTileCatch;


    @Operation(summary = "查询通道信息", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "id", description = "通道的数据库自增Id", required = true)
    @GetMapping(value = "/one")
    public CommonGBChannel getOne(int id){
        return channelService.getOne(id);
    }

    @Operation(summary = "获取行业编码列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping("/industry/list")
    public List<IndustryCodeType> getIndustryCodeList(){
        return channelService.getIndustryCodeList();
    }

    @Operation(summary = "获取编码列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping("/type/list")
    public List<DeviceType> getDeviceTypeList(){
        return channelService.getDeviceTypeList();
    }

    @Operation(summary = "获取编码列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping("/network/identification/list")
    public List<NetworkIdentificationType> getNetworkIdentificationTypeList(){
        return channelService.getNetworkIdentificationTypeList();
    }

    @Operation(summary = "更新通道", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/update")
    public void update(@RequestBody CommonGBChannel channel){
        BeanWrapperImpl wrapper = new BeanWrapperImpl(channel);
        int count = 0;
        for (PropertyDescriptor pd : wrapper.getPropertyDescriptors()) {
            String name = pd.getName();
            if ("class".equals(name)) continue;
            if (pd.getReadMethod() == null) continue;
            Object val = wrapper.getPropertyValue(name);
            if (val != null) count++;
        }
        Assert.isTrue(count > 1, "未进行任何修改");
        channelService.update(channel);
    }


    @Operation(summary = "重置国标通道", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/reset")
    public void reset(@RequestBody ResetParam param){
        Assert.notNull(param.getId(), "通道ID不能为空");
        Assert.notEmpty(param.getChanelFields(), "待重置字段不可以空");
        channelService.reset(param.getId(), param.getChanelFields());
    }

    @Operation(summary = "增加通道", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/add")
    public CommonGBChannel add(@RequestBody CommonGBChannel channel){
        channelService.add(channel);
        return channel;
    }

    @Operation(summary = "获取通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "page", description = "当前页", required = true)
    @Parameter(name = "count", description = "每页查询数量", required = true)
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "hasRecordPlan", description = "是否已设置录制计划")
    @Parameter(name = "channelType", description = "通道类型， 1：国标设备，2：推流设备，3：拉流代理")
    @Parameter(name = "civilCode", description = "行政区划")
    @Parameter(name = "parentDeviceId", description = "父节点编码")
    @GetMapping("/list")
    public PageInfo<CommonGBChannel> queryList(int page, int count,
                                                          @RequestParam(required = false) String query,
                                                          @RequestParam(required = false) Boolean online,
                                                          @RequestParam(required = false) Boolean hasRecordPlan,
                                                          @RequestParam(required = false) Integer channelType,
                                                          @RequestParam(required = false) String civilCode,
                                                          @RequestParam(required = false) String parentDeviceId){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        if (ObjectUtils.isEmpty(civilCode)){
            civilCode = null;
        }
        if (ObjectUtils.isEmpty(parentDeviceId)){
            parentDeviceId = null;
        }
        return channelService.queryList(page, count, query, online, hasRecordPlan, channelType, civilCode, parentDeviceId);
    }

    @Operation(summary = "获取关联行政区划通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "page", description = "当前页", required = true)
    @Parameter(name = "count", description = "每页查询数量", required = true)
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "channelType", description = "通道类型， 0：国标设备，1：推流设备，2：拉流代理")
    @Parameter(name = "civilCode", description = "行政区划")
    @GetMapping("/civilcode/list")
    public PageInfo<CommonGBChannel> queryListByCivilCode(int page, int count,
                                               @RequestParam(required = false) String query,
                                               @RequestParam(required = false) Boolean online,
                                               @RequestParam(required = false) Integer channelType,
                                               @RequestParam(required = false) String civilCode){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        return channelService.queryListByCivilCode(page, count, query, online, channelType, civilCode);
    }


    @Operation(summary = "存在行政区划但无法挂载的通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "page", description = "当前页", required = true)
    @Parameter(name = "count", description = "每页查询数量", required = true)
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "channelType", description = "通道类型， 0：国标设备，1：推流设备，2：拉流代理")
    @GetMapping("/civilCode/unusual/list")
    public PageInfo<CommonGBChannel> queryListByCivilCodeForUnusual(int page, int count,
                                                          @RequestParam(required = false) String query,
                                                          @RequestParam(required = false) Boolean online,
                                                          @RequestParam(required = false) Integer channelType){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        return channelService.queryListByCivilCodeForUnusual(page, count, query, online, channelType);
    }


    @Operation(summary = "存在父节点编号但无法挂载的通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "page", description = "当前页", required = true)
    @Parameter(name = "count", description = "每页查询数量", required = true)
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "channelType", description = "通道类型， 0：国标设备，1：推流设备，2：拉流代理")
    @GetMapping("/parent/unusual/list")
    public PageInfo<CommonGBChannel> queryListByParentForUnusual(int page, int count,
                                                          @RequestParam(required = false) String query,
                                                          @RequestParam(required = false) Boolean online,
                                                          @RequestParam(required = false) Integer channelType){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        return channelService.queryListByParentForUnusual(page, count, query, online, channelType);
    }

    @Operation(summary = "清除存在行政区划但无法挂载的通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "param", description = "清理参数， all为true清理所有异常数据。 否则按照传入的设备Id清理", required = true)
    @PostMapping("/civilCode/unusual/clear")
    public void clearChannelCivilCode(@RequestBody ChannelToRegionParam param){
        channelService.clearChannelCivilCode(param.getAll(), param.getChannelIds());
    }

    @Operation(summary = "清除存在分组节点但无法挂载的通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "param", description = "清理参数， all为true清理所有异常数据。 否则按照传入的设备Id清理", required = true)
    @PostMapping("/parent/unusual/clear")
    public void clearChannelParent(@RequestBody ChannelToRegionParam param){
        channelService.clearChannelParent(param.getAll(), param.getChannelIds());
    }

    @Operation(summary = "获取关联业务分组通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "page", description = "当前页", required = true)
    @Parameter(name = "count", description = "每页查询数量", required = true)
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "channelType", description = "通道类型， 0：国标设备，1：推流设备，2：拉流代理")
    @Parameter(name = "groupDeviceId", description = "业务分组下的父节点ID")
    @GetMapping("/parent/list")
    public PageInfo<CommonGBChannel> queryListByParentId(int page, int count,
                                               @RequestParam(required = false) String query,
                                               @RequestParam(required = false) Boolean online,
                                               @RequestParam(required = false) Integer channelType,
                                               @RequestParam(required = false) String groupDeviceId){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        return channelService.queryListByParentId(page, count, query, online, channelType, groupDeviceId);
    }

    @Operation(summary = "通道设置行政区划", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/region/add")
    public void addChannelToRegion(@RequestBody ChannelToRegionParam param){
        Assert.notEmpty(param.getChannelIds(),"通道ID不可为空");
        Assert.hasLength(param.getCivilCode(),"未添加行政区划");
        channelService.addChannelToRegion(param.getCivilCode(), param.getChannelIds());
    }

    @Operation(summary = "通道删除行政区划", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/region/delete")
    public void deleteChannelToRegion(@RequestBody ChannelToRegionParam param){
        Assert.isTrue(!param.getChannelIds().isEmpty() || !ObjectUtils.isEmpty(param.getCivilCode()),"参数异常");
        channelService.deleteChannelToRegion(param.getCivilCode(), param.getChannelIds());
    }

    @Operation(summary = "通道设置行政区划-根据国标设备", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/region/device/add")
    public void addChannelToRegionByGbDevice(@RequestBody ChannelToRegionByGbDeviceParam param){
        Assert.notEmpty(param.getDeviceIds(),"参数异常");
        Assert.hasLength(param.getCivilCode(),"未添加行政区划");
        channelService.addChannelToRegionByGbDevice(param.getCivilCode(), param.getDeviceIds());
    }

    @Operation(summary = "通道删除行政区划-根据国标设备", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/region/device/delete")
    public void deleteChannelToRegionByGbDevice(@RequestBody ChannelToRegionByGbDeviceParam param){
        Assert.notEmpty(param.getDeviceIds(),"参数异常");
        channelService.deleteChannelToRegionByGbDevice(param.getDeviceIds());
    }

    @Operation(summary = "通道设置业务分组", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/group/add")
    public void addChannelToGroup(@RequestBody ChannelToGroupParam param){
        Assert.notEmpty(param.getChannelIds(),"通道ID不可为空");
        Assert.hasLength(param.getParentId(),"未添加上级分组编号");
        Assert.hasLength(param.getBusinessGroup(),"未添加业务分组");
        channelService.addChannelToGroup(param.getParentId(), param.getBusinessGroup(), param.getChannelIds());
    }

    @Operation(summary = "通道删除业务分组", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/group/delete")
    public void deleteChannelToGroup(@RequestBody ChannelToGroupParam param){
        Assert.isTrue(!param.getChannelIds().isEmpty()
                || (!ObjectUtils.isEmpty(param.getParentId()) && !ObjectUtils.isEmpty(param.getBusinessGroup())),
                "参数异常");
        channelService.deleteChannelToGroup(param.getParentId(), param.getBusinessGroup(), param.getChannelIds());
    }

    @Operation(summary = "通道设置业务分组-根据国标设备", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/group/device/add")
    public void addChannelToGroupByGbDevice(@RequestBody ChannelToGroupByGbDeviceParam param){
        Assert.notEmpty(param.getDeviceIds(),"参数异常");
        Assert.hasLength(param.getParentId(),"未添加上级分组编号");
        Assert.hasLength(param.getBusinessGroup(),"未添加业务分组");
        channelService.addChannelToGroupByGbDevice(param.getParentId(), param.getBusinessGroup(), param.getDeviceIds());
    }

    @Operation(summary = "通道删除业务分组-根据国标设备", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/group/device/delete")
    public void deleteChannelToGroupByGbDevice(@RequestBody ChannelToGroupByGbDeviceParam param){
        Assert.notEmpty(param.getDeviceIds(),"参数异常");
        channelService.deleteChannelToGroupByGbDevice(param.getDeviceIds());
    }

    @Operation(summary = "播放通道", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping("/play")
    public DeferredResult<WVPResult<StreamContent>> play(HttpServletRequest request,  Integer channelId){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");

        DeferredResult<WVPResult<StreamContent>> result = new DeferredResult<>(userSetting.getPlayTimeout().longValue());

        ErrorCallback<StreamInfo> callback = (code, msg, streamInfo) -> {
            if (code == InviteErrorCode.SUCCESS.getCode()) {
                WVPResult<StreamContent> wvpResult = WVPResult.success();
                if (streamInfo != null) {
                    if (userSetting.getUseSourceIpAsStreamIp()) {
                        streamInfo=streamInfo.clone();//深拷贝
                        String host;
                        try {
                            URL url=new URL(request.getRequestURL().toString());
                            host=url.getHost();
                        } catch (MalformedURLException e) {
                            host=request.getLocalAddr();
                        }
                        streamInfo.changeStreamIp(host);
                    }
                    if (!ObjectUtils.isEmpty(streamInfo.getMediaServer().getTranscodeSuffix())
                            && !"null".equalsIgnoreCase(streamInfo.getMediaServer().getTranscodeSuffix())) {
                        streamInfo.setStream(streamInfo.getStream() + "_" + streamInfo.getMediaServer().getTranscodeSuffix());
                    }
                    wvpResult.setData(new StreamContent(streamInfo));
                }else {
                    wvpResult.setCode(code);
                    wvpResult.setMsg(msg);
                }
                result.setResult(wvpResult);
            }else {
                result.setResult(WVPResult.fail(code, msg));
            }
        };
        channelPlayService.play(channel, null, userSetting.getRecordSip(), callback);
        return result;
    }

    @Operation(summary = "停止播放通道", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping("/play/stop")
    public void stopPlay(Integer channelId){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.stopPlay(channel);
    }

    @Operation(summary = "录像查询", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "startTime", description = "开始时间", required = true)
    @Parameter(name = "endTime", description = "结束时间", required = true)
    @GetMapping("/playback/query")
    public DeferredResult<WVPResult<List<CommonRecordInfo>>> queryRecord(Integer channelId, String startTime, String endTime){

        DeferredResult<WVPResult<List<CommonRecordInfo>>> result = new DeferredResult<>(Long.valueOf(userSetting.getRecordInfoTimeout()), TimeUnit.MILLISECONDS);
        if (!DateUtil.verification(startTime, DateUtil.formatter)){
            throw new ControllerException(ErrorCode.ERROR100.getCode(), "startTime格式为" + DateUtil.PATTERN);
        }
        if (!DateUtil.verification(endTime, DateUtil.formatter)){
            throw new ControllerException(ErrorCode.ERROR100.getCode(), "endTime格式为" + DateUtil.PATTERN);
        }
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");

        channelPlayService.queryRecord(channel, startTime, endTime, (code, msg, data) -> {
            WVPResult<List<CommonRecordInfo>> wvpResult = new WVPResult<>();
            wvpResult.setCode(code);
            wvpResult.setMsg(msg);
            wvpResult.setData(data);
            result.setResult(wvpResult);
        });
        result.onTimeout(()->{
            WVPResult<List<CommonRecordInfo>> wvpResult = new WVPResult<>();
            wvpResult.setCode(ErrorCode.ERROR100.getCode());
            wvpResult.setMsg("timeout");
            result.setResult(wvpResult);
        });
        return result;
    }

    @Operation(summary = "录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "startTime", description = "开始时间", required = true)
    @Parameter(name = "endTime", description = "结束时间", required = true)
    @GetMapping("/playback")
    public DeferredResult<WVPResult<StreamContent>> playback(HttpServletRequest request, Integer channelId, String startTime, String endTime){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");

        DeferredResult<WVPResult<StreamContent>> result = new DeferredResult<>(userSetting.getPlayTimeout().longValue());

        ErrorCallback<StreamInfo> callback = (code, msg, streamInfo) -> {
            if (code == InviteErrorCode.SUCCESS.getCode()) {
                WVPResult<StreamContent> wvpResult = WVPResult.success();
                if (streamInfo != null) {
                    if (userSetting.getUseSourceIpAsStreamIp()) {
                        streamInfo=streamInfo.clone();//深拷贝
                        String host;
                        try {
                            URL url=new URL(request.getRequestURL().toString());
                            host=url.getHost();
                        } catch (MalformedURLException e) {
                            host=request.getLocalAddr();
                        }
                        streamInfo.changeStreamIp(host);
                    }
                    if (!ObjectUtils.isEmpty(streamInfo.getMediaServer().getTranscodeSuffix())
                            && !"null".equalsIgnoreCase(streamInfo.getMediaServer().getTranscodeSuffix())) {
                        streamInfo.setStream(streamInfo.getStream() + "_" + streamInfo.getMediaServer().getTranscodeSuffix());
                    }
                    wvpResult.setData(new StreamContent(streamInfo));
                }else {
                    wvpResult.setCode(code);
                    wvpResult.setMsg(msg);
                }

                result.setResult(wvpResult);
            }else {
                result.setResult(WVPResult.fail(code, msg));
            }
        };
        channelPlayService.playback(channel, DateUtil.yyyy_MM_dd_HH_mm_ssToTimestamp(startTime),
                DateUtil.yyyy_MM_dd_HH_mm_ssToTimestamp(endTime), callback);
        return result;
    }

    @Operation(summary = "停止录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @GetMapping("/playback/stop")
    public void stopPlayback(Integer channelId, String stream){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.stopPlayback(channel, stream);
    }

    @Operation(summary = "暂停录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @GetMapping("/playback/pause")
    public void pausePlayback(Integer channelId, String stream){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.playbackPause(channel, stream);
    }

    @Operation(summary = "恢复录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @GetMapping("/playback/resume")
    public void resumePlayback(Integer channelId, String stream){
        Assert.notNull(channelId,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.playbackResume(channel, stream);
    }

    @Operation(summary = "拖动录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @Parameter(name = "seekTime", description = "将要播放的时间", required = true)
    @GetMapping("/playback/seek")
    public void seekPlayback(Integer channelId, String stream, Long seekTime){
        Assert.notNull(channelId,"参数异常");
        Assert.notNull(seekTime,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.playbackSeek(channel, stream, seekTime);
    }

    @Operation(summary = "拖动录像回放", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "通道ID", required = true)
    @Parameter(name = "stream", description = "流ID", required = true)
    @Parameter(name = "speed", description = "倍速", required = true)
    @GetMapping("/playback/speed")
    public void seekPlayback(Integer channelId, String stream, Double speed){
        Assert.notNull(channelId,"参数异常");
        Assert.notNull(speed,"参数异常");
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");
        channelPlayService.playbackSpeed(channel, stream, speed);
    }

    @Operation(summary = "为地图获取通道列表", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "query", description = "查询内容")
    @Parameter(name = "online", description = "是否在线")
    @Parameter(name = "hasRecordPlan", description = "是否已设置录制计划")
    @Parameter(name = "channelType", description = "通道类型， 0：国标设备，1：推流设备，2：拉流代理")
    @Parameter(name = "geoCoordSys", description = "地理坐标系， WGS84/GCJ02")
    @GetMapping("/map/list")
    public List<CommonGBChannel> queryListForMap(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean online,
            @RequestParam(required = false) Boolean hasRecordPlan,
            @RequestParam(required = false) Integer channelType){
        if (ObjectUtils.isEmpty(query)){
            query = null;
        }
        return channelService.queryListForMap(query, online, hasRecordPlan, channelType);
    }

    @Operation(summary = "为地图去除抽稀结果", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/map/reset-level")
    public void resetLevel(){
        channelService.resetLevel();
    }

    @Operation(summary = "执行抽稀", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @PostMapping("/map/thin/draw")
    public String drawThin(@RequestBody DrawThinParam param){
        if(param == null || param.getZoomParam() == null || param.getZoomParam().isEmpty()) {
            throw new ControllerException(ErrorCode.ERROR400);
        }
        return channelService.drawThin(param.getZoomParam(), param.getExtent(), param.getGeoCoordSys());
    }

    @Operation(summary = "清除未保存的抽稀结果", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "id", description = "抽稀ID", required = true)
    @GetMapping("/map/thin/clear")
    public void clearThin(String id){
        vectorTileCatch.remove(id);
    }

    @Operation(summary = "保存的抽稀结果", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "id", description = "抽稀ID", required = true)
    @GetMapping("/map/thin/save")
    public void saveThin(String id){
        channelService.saveThin(id);
    }

    @Operation(summary = "获取抽稀执行的进度", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "id", description = "抽稀ID", required = true)
    @GetMapping("/map/thin/progress")
    public DrawThinProcess thinProgress(String id){
        return channelService.thinProgress(id);
    }

    @Operation(summary = "为地图提供标准mvt图层", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping(value = "/map/tile/{z}/{x}/{y}", produces = "application/x-protobuf")
    @Parameter(name = "geoCoordSys", description = "地理坐标系， WGS84/GCJ02")
    public ResponseEntity<byte[]> getTile(@PathVariable int z, @PathVariable int x, @PathVariable int y, String geoCoordSys){

        try {
            byte[] mvt = channelService.getTile(z, x, y, geoCoordSys);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/x-protobuf"));
            if (mvt == null) {
                headers.setContentLength(0);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
            headers.setContentLength(mvt.length);
            return new ResponseEntity<>(mvt, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("构建矢量瓦片失败： z: {}, x: {}, y:{}", z, x, y, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "为地图提供经过抽稀的标准mvt图层", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @GetMapping(value = "/map/thin/tile/{z}/{x}/{y}", produces = "application/x-protobuf")
    @Parameter(name = "geoCoordSys", description = "地理坐标系， WGS84/GCJ02")
    @Parameter(name = "thinId", description = "抽稀结果ID")
    public ResponseEntity<byte[]> getThinTile(@PathVariable int z, @PathVariable int x, @PathVariable int y,
                                              String geoCoordSys, @RequestParam(required = false) String thinId){

        if (ObjectUtils.isEmpty(thinId)) {
            thinId = "DEFAULT";
        }
        String catchKey = z + "_" + x + "_" + y + "_" + geoCoordSys.toUpperCase();
        byte[] mvt = vectorTileCatch.getVectorTile(thinId, catchKey);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/x-protobuf"));
        if (mvt == null) {
            headers.setContentLength(0);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }

        headers.setContentLength(mvt.length);
        return new ResponseEntity<>(mvt, headers, HttpStatus.OK);
    }



    @Operation(summary = "全局通道截图并返回路径", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "全局通道ID", required = true)
    @GetMapping("/snap")
    public DeferredResult<WVPResult<String>> requestSnap(int channelId) {
        if (log.isDebugEnabled()) {
            log.debug("全局通道截图: {}", channelId);
        }

        DeferredResult<WVPResult<String>> result = new DeferredResult<>(5 * 1000L);

        // 获取通道信息
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");

        String uuid = UUID.randomUUID().toString();
        String key,app,stream;

        // 根据通道类型调用不同的截图服务
        switch (channel.getDataType()) {
            case 1: // 国标设备

                key = DeferredResultHolder.CALLBACK_CMD_SNAP + channel.getGbDeviceId();
                resultHolder.put(key, uuid, result);

                RequestMessage message = new RequestMessage();
                message.setKey(key);
                message.setId(uuid);

                String deviceId = channel.getGbDeviceId();


                String fileName = deviceId + "_" + deviceId  + "_" + DateUtil.getNowForUrl() + ".jpg";
                playService.getSnap(deviceId, deviceId , fileName, (code, msg, data) -> {
                    if (code == InviteErrorCode.SUCCESS.getCode()) {
                        WVPResult<String> wvpResult = new WVPResult<>();
                        wvpResult.setCode(0);
                        wvpResult.setMsg("截图成功");
                        wvpResult.setData(data.toString());
                        result.setResult(wvpResult);
                    } else {
                        result.setResult(WVPResult.fail(code, msg));
                    }
                });
                break;

            case 2: // 推流设备

                // 获取媒体服务器信息
                StreamPush streamPush = streamPushService.getPush(channel.getDataDeviceId());
                app = streamPush.getApp();
                stream = streamPush.getStream();

                key = DeferredResultHolder.CALLBACK_CMD_PUSH_SNAP + app + "_" + stream;
                resultHolder.put(key, uuid, result);


                if (streamPush == null) {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR404.getCode(), "推流设备未找到"));
                    return result;
                }

                MediaServer mediaServer = mediaServerService.getOne(streamPush.getMediaServerId());
                if (mediaServer == null) {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR100.getCode(), "流媒体未找到"));
                    return result;
                }

                // 构建流URL并请求截图
//                String streamUrl;
//                if (mediaServer.getRtspPort() != 0) {
//                    streamUrl = String.format("rtsp://127.0.0.1:%s/%s/%s", mediaServer.getRtspPort(), app, stream);
//                } else {
//                    streamUrl = String.format("http://127.0.0.1:%s/%s/%s.live.mp4", mediaServer.getHttpPort(), app, stream);
//                }

                String path = "snap";
                String pushFileName = app + "_" + stream + "_" +  DateUtil.getNowForUrl() + ".jpg";

                // 请求截图
                log.info("[请求推流设备截图]: " + pushFileName);
                mediaServerService.getSnap(mediaServer, app, stream, 15, 1, path, pushFileName);

                File snapFile = new File(path + File.separator + pushFileName);
                if (snapFile.exists()) {
                    WVPResult<String> wvpResult = new WVPResult<>();
                    wvpResult.setCode(0);
                    wvpResult.setMsg("截图成功");
                    wvpResult.setData(snapFile.getAbsolutePath());
                    result.setResult(wvpResult);
                } else {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR100.getCode(), "获取截图失败"));
                }
                break;

            case 3: // 拉流代理

                // 获取拉流代理信息
                StreamProxy streamProxy = streamProxyService.getStreamProxyById(channel.getDataDeviceId());
                app = streamProxy.getApp();
                stream = streamProxy.getStream();

                key = DeferredResultHolder.CALLBACK_CMD_PROXY_SNAP + app + "_" + stream;
                resultHolder.put(key, uuid, result);


                if (streamProxy == null) {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR404.getCode(), "拉流代理未找到"));
                    return result;
                }

                MediaServer proxyMediaServer = mediaServerService.getOne(streamProxy.getMediaServerId());
                if (proxyMediaServer == null) {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR100.getCode(), "流媒体未找到"));
                    return result;
                }

                // 构建流URL并请求截图
//                String proxyStreamUrl;
//                if (proxyMediaServer.getRtspPort() != 0) {
//                    proxyStreamUrl = String.format("rtsp://127.0.0.1:%s/%s/%s", proxyMediaServer.getRtspPort(), app, stream);
//                } else {
//                    proxyStreamUrl = String.format("http://127.0.0.1:%s/%s/%s.live.mp4", proxyMediaServer.getHttpPort(), app, stream);
//                }

                String proxyPath = "snap";
                String proxyFileName = app + "_" + stream + "_" +  DateUtil.getNowForUrl() +  ".jpg";

                // 请求截图
                log.info("[请求拉流代理截图]: " + proxyFileName);
                mediaServerService.getSnap(proxyMediaServer, app, stream, 15, 1, proxyPath, proxyFileName);

                File proxySnapFile = new File(proxyPath + File.separator + proxyFileName);
                if (proxySnapFile.exists()) {
                    WVPResult<String> wvpResult = new WVPResult<>();
                    wvpResult.setCode(0);
                    wvpResult.setMsg("截图成功");
                    wvpResult.setData(proxySnapFile.getAbsolutePath());
                    result.setResult(wvpResult);
                } else {
                    result.setResult(WVPResult.fail(ErrorCode.ERROR100.getCode(), "获取截图失败"));
                }
                break;

            default:
                result.setResult(WVPResult.fail(ErrorCode.ERROR100.getCode(), "不支持的通道类型"));
        }

        return result;
    }

    @Operation(summary = "获取全局通道截图并直接返回图片流（高效模式）", security = @SecurityRequirement(name = JwtUtils.HEADER))
    @Parameter(name = "channelId", description = "全局通道ID", required = true)
    @GetMapping("/snap/stream")
    public void getSnapStream(HttpServletResponse resp, int channelId) {
        // 获取通道信息
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");

        try {
            byte[] imageBytes = null;
            String app, stream;

            // 根据通道类型调用不同的截图服务
            switch (channel.getDataType()) {
                case 1: // 国标设备
                    String deviceId = channel.getGbDeviceId();
                    playService.getSnapBytes(deviceId, deviceId, (code, msg, data) -> {
                        try {
                            if (code == InviteErrorCode.SUCCESS.getCode() && data != null) {
                                resp.setContentType(MediaType.IMAGE_JPEG_VALUE);
                                resp.setContentLength(data.length);
                                resp.getOutputStream().write(data);
                                resp.getOutputStream().flush();
                            } else {
                                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
                            }
                        } catch (IOException e) {
                            log.error("返回国标设备截图流时发生错误: {}", e.getMessage());
                            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        }
                    });
                    return;

                case 2: // 推流设备
                    StreamPush streamPush = streamPushService.getPush(channel.getDataDeviceId());
                    if (streamPush == null) {
                        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    MediaServer mediaServer = mediaServerService.getOne(streamPush.getMediaServerId());
                    if (mediaServer == null) {
                        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        return;
                    }

                    app = streamPush.getApp();
                    stream = streamPush.getStream();
                    imageBytes = mediaServerService.getSnapBytes(mediaServer, app, stream, 15);
                    break;

                case 3: // 拉流代理
                    StreamProxy streamProxy = streamProxyService.getStreamProxyById(channel.getDataDeviceId());
                    if (streamProxy == null) {
                        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    MediaServer proxyMediaServer = mediaServerService.getOne(streamProxy.getMediaServerId());
                    if (proxyMediaServer == null) {
                        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        return;
                    }

                    app = streamProxy.getApp();
                    stream = streamProxy.getStream();
                    imageBytes = mediaServerService.getSnapBytes(proxyMediaServer, app, stream, 15);
                    break;

                default:
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
            }

            if (imageBytes != null && imageBytes.length > 0) {
                resp.setContentType(MediaType.IMAGE_JPEG_VALUE);
                resp.setContentLength(imageBytes.length);
                resp.getOutputStream().write(imageBytes);
                resp.getOutputStream().flush();
            } else {
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }

        } catch (IOException e) {
            log.error("返回截图流时发生错误: {}", e.getMessage());
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "返回全局通道截图图片")
    @Parameter(name = "channelId", description = "全局通道ID", required = true)
    @Parameter(name = "mark", description = "标识", required = false)
    @GetMapping("/getsnap")
    public void getSnap(HttpServletResponse resp, int channelId, @RequestParam(required = false) String mark) {
        // 获取通道信息
        CommonGBChannel channel = channelService.getOne(channelId);
        Assert.notNull(channel, "通道不存在");


        try {
            // 构建截图文件路径
            String fileName,app,stream;
            switch (channel.getDataType()) {
                case 1: // 国标设备
                    String deviceId = channel.getGbDeviceId();

                    fileName = deviceId + "_" + deviceId;
                    break;
                case 2: // 推流设备
                    StreamPush streamPush = streamPushService.getPush(channel.getDataDeviceId());
                    app = streamPush.getApp();
                    stream = streamPush.getStream();
                    fileName = app + "_" + stream;
                    break;
                case 3: // 拉流代理
                    StreamProxy streamProxy = streamProxyService.getStreamProxyById(channel.getDataDeviceId());
                    app = streamProxy.getApp();
                    stream = streamProxy.getStream();
                    fileName = app + "_" + stream;
                    break;
                default:
                    resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
                    return;
            }

            fileName = fileName + (mark == null ? ".jpg" : ("_" + mark + ".jpg"));

            // 读取截图文件并返回
            final InputStream in = Files.newInputStream(new File("snap" + File.separator + fileName).toPath());
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
