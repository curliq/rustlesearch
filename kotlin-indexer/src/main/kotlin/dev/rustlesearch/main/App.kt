/*
 * This Kotlin source file was generated by the Gradle 'init' task.
 */
package dev.rustlesearch.main

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.javadsl.FileIO
import akka.stream.javadsl.Flow
import akka.stream.javadsl.Sink
import akka.stream.javadsl.Source
import akka.util.ByteString
import dev.rustlesearch.pipelines.Flows
import dev.rustlesearch.pipelines.Message
import dev.rustlesearch.pipelines.PipelineConfig
import org.apache.http.HttpHost
import org.elasticsearch.client.RestClient
import java.nio.file.Paths

fun main(args: Array<String>) {

    val client = RestClient.builder(HttpHost("localhost", 9201)).build()
    val system = ActorSystem.create()
    val materializer = ActorMaterializer.create(system)
    val fileSource = FileIO.fromPath(Paths.get("build.gradle"))
    val sink = Sink.foreach<Message> { println(it) }
    fileSource
            .via(Flows.lineToMessage("string"))
    runnable.run(materializer)
 }
