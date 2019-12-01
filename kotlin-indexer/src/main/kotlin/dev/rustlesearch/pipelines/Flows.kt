package dev.rustlesearch.pipelines

import akka.NotUsed
import akka.stream.ActorAttributes
import akka.stream.Supervision
import akka.stream.javadsl.*
import akka.util.ByteString
import java.nio.file.Path

const val timestampRegex = "\\[(?<tsStr>.{23})\\]"
const val usernameRegex = "(?<username>[a-z0-9_\\$]{2,30})"
const val textRegex = "(?<text>.{1,512})"
val regexString = listOf(
    "^",
    timestampRegex,
    "\\s",
    usernameRegex,
    ":\\s",
    textRegex
).joinToString("")
val messageRegex =
    Regex(regexString, setOf(RegexOption.IGNORE_CASE, RegexOption.UNIX_LINES))

object Flows {

    val lineToMessage: Flow<ChannelLine, Message, NotUsed> =
        Flow.create<ChannelLine>()
            .map(::lineToBasicMessage)
            .map(::messageEvolveIso)
            .log("line to message")
            .withAttributes(
                ActorAttributes.withSupervisionStrategy(Supervision.getResumingDecider())
            )
    val filesToLines: Flow<Path, ChannelLine, NotUsed> = Flow.create<Path>()
        .flatMapConcat { path ->
            FileIO
                .fromPath(path)
                .via(Compression.inflate(1000))
                .via(splitLines)
                .map { bodyToChannelLine(path, it) }
        }
    private val splitLines: Flow<ByteString, String, NotUsed> =
        Framing.delimiter(
            ByteString.fromString("\n"),
            10000,
            FramingTruncation.ALLOW
        ).map(ByteString::utf8String)

    private fun bodyToChannelLine(path: Path, line: String): ChannelLine {
        val channel = path.fileName.toString().split("::")[0]
        return ChannelLine(channel, line)
    }

    private fun lineToBasicMessage(channelLine: ChannelLine): Message {
        val (channel, line) = channelLine
        val matchResult = messageRegex.find(line)
        val (ts, username, text) = matchResult?.destructured
            ?: throw Error("Line was badly formatted")
        return Message(ts, channel.capitalize(), username.toLowerCase(), text)
    }

    private fun messageEvolveIso(message: Message): Message {
        val ts = message.ts
        val yyyy = ts.slice(0..3)
        val MM = ts.slice(5..6)
        val dd = ts.slice(8..9)
        val hh = ts.slice(11..12)
        val mm = ts.slice(14..15)
        val ss = ts.slice(17..18)

        return message.copy(ts = "$yyyy-$MM-${dd}T$hh:$mm:$ss.000Z")
    }
}
