package dev.rustlesearch.pipelines

import akka.stream.Attributes
import akka.stream.Inlet
import akka.stream.SinkShape
import akka.stream.stage.AbstractInHandler
import akka.stream.stage.GraphStage
import akka.stream.stage.GraphStageLogic
import org.elasticsearch.action.ActionListener
import org.elasticsearch.action.bulk.BulkProcessor
import org.elasticsearch.action.bulk.BulkRequest
import org.elasticsearch.action.bulk.BulkResponse
import org.elasticsearch.action.index.IndexRequest
import org.elasticsearch.client.RequestOptions
import org.elasticsearch.client.RestHighLevelClient
import org.elasticsearch.common.unit.ByteSizeUnit
import org.elasticsearch.common.unit.ByteSizeValue

object Sinks {
    class ElasticMessageSink(val client: RestHighLevelClient) : GraphStage<SinkShape<Message>>() {
        private val input: Inlet<Message> = Inlet.create<Message>("ElasticMessageSink.input")

        override fun shape(): SinkShape<Message> {
            return SinkShape.of(input)
        }

        override fun createLogic(inheritedAttributes: Attributes?): GraphStageLogic {
            return object : GraphStageLogic(shape()) {
                private var listener: BulkProcessor.Listener = object : BulkProcessor.Listener {
                    override fun beforeBulk(
                        executionId: Long,
                        request: BulkRequest
                    ) {
                        val numberOfActions = request.numberOfActions()
                        println("Executing bulk [$executionId] with $numberOfActions requests")
                    }

                    override fun afterBulk(
                        executionId: Long,
                        request: BulkRequest,
                        response: BulkResponse
                    ) {

                        if (response.hasFailures()) {

                            println("Bulk [$executionId] executed with failures")
                        } else {

                            println(
                                "Bulk [$executionId] completed in ${response.took.millis} milliseconds"
                            )
                        }
                    }

                    override fun afterBulk(
                        executionId: Long,
                        request: BulkRequest,
                        failure: Throwable
                    ) {
                        println("Failed to execute bulk")
                        println(failure)
                    }
                }
                private var builder = BulkProcessor.builder(
                    { request: BulkRequest?, bulkListener: ActionListener<BulkResponse?>? ->
                        client.bulkAsync(
                            request, RequestOptions.DEFAULT, bulkListener
                        )
                    }, listener
                )

                override fun preStart() { // initiate the flow of data by issuing a first pull on materialization:
                    pull(input)
                }

                init {
                    builder.setBulkActions(-1)
//                    builder.setBulkSize(ByteSizeValue(1L, ByteSizeUnit.MB))
                    val bulkProcessor = builder.build()
                    setHandler(input, object : AbstractInHandler() {
                        override fun onPush() { // We grab the element from the input port.
                            val message = grab(input)
                            val jsonMap = mapOf(
                                "ts" to message.ts,
                                "text" to message.text,
                                "channel" to message.channel,
                                "username" to message.username
                            )
                            val indexRequest =
                                IndexRequest("rustlesearch").source(jsonMap).setPipeline("rustlesearch-pipeline")
                            bulkProcessor.add(indexRequest)
                            return pull(input)
                        }
                    })
                }
            }
        }
    }
}
