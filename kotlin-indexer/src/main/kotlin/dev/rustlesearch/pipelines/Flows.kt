package dev.rustlesearch.pipelines

import akka.NotUsed
import akka.stream.ActorAttributes
import akka.stream.Materializer
import akka.stream.Supervision
import akka.stream.javadsl.Flow

const val timestampRegex = "\\[(?<tsStr>.{23})\\]"
const val usernameRegex = "(?<username>[a-z0-9_\\$]{2,30})"
const val textRegex = "(?<text>.{1,512})"
val regexString = listOf("^", timestampRegex, "\\s", usernameRegex, ":\\s", textRegex).joinToString("")
val messageRegex = Regex(regexString, setOf(RegexOption.IGNORE_CASE, RegexOption.UNIX_LINES))

object Flows {

    fun lineToMessage(indexPrefix: String): Flow<ChannelLine, Message, NotUsed> =
        Flow.create<ChannelLine>()
                .map { it.copy(line = it.line.replace("\r", "")) }
                .map { lineToBasicMessage(it) }
                .map { messageEvolveIso(it) }
                .map { it.copy(index = "${indexPrefix}-${it.index}") }
                .log("line to message")
                .withAttributes(ActorAttributes.withSupervisionStrategy(Supervision.getResumingDecider()))

    private fun lineToBasicMessage(channelLine: ChannelLine): Message {
        val (channel, line) = channelLine
        val matchResult = messageRegex.find(line)
        val (ts, username, text) = matchResult?.destructured ?: throw Error("Line was badly formatted")
        return Message(ts, channel, username, text, "rustlesearch")
    }

    private fun messageEvolveIso(message: Message): Message {
        val ts = message.ts
        val yyyy = ts.slice(0..4)
        val MM = ts.slice(5..7)
        val dd = ts.slice(8..10)
        val hh = ts.slice(11..13)
        val mm = ts.slice(14..16)
        val ss = ts.slice(17..19)

        return message.copy(ts = "${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z", index = "$yyyy-$MM-${message.channel}")
    }
}