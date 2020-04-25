import superagent from "superagent";

const baseUrl = process.env.VUE_APP_API;

export default {
  async getChannels({ commit }) {
    try {
      const { text } = await superagent.get(`${baseUrl}/channels.txt`);
      commit("setChannels", text.trim().split("\n"));
    } catch (e) {
      console.log(e);
    }
  }
};
