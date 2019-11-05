package dev.rustlesearch.pipelines

import akka.stream.ActorMaterializer
import org.elasticsearch.client.RestClient

data class PipelineConfig(val materializer: ActorMaterializer)
data class RabbitConfig(val rabbitIndex: String)
data class ElasticConfig(val indexPrefix: String, val client: RestClient)

data class Message(val ts: String, val channel: String, val username: String, val text: String, val index: String?)
data class ChannelLine(val channel: String, val line: String)
