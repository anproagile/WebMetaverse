/// <reference path="../verse/verseclient.ts" />
module wm.ui {
    export class UserInterface {

        constructor(client: wm.verse.VerseClient) {
            var multiplayer = client.multiUserClient;
            this.initChatUI(multiplayer);
        }

        initChatUI(multi: wm.multi.MultiUserClient) {

            var el = <WMChatElement>document.querySelector('#wmchat');
            var chat = multi.networkClient.chat;
            var username = multi.networkClient.localId;

            if (!el) {
                console.warn('There appears to be no Chat UI, aborting linking up with it');
                return;
            }

            chat.onReceiveChat.add((data, sender) => {
                el.messages.push({ user: sender, message: data.msg }); 
            });

            el.addEventListener('chat', (event: any) => {
                var message = event.detail.msg;

                chat.sendChat(message);

                //Show my own chat message
                el.messages.push({ user: username, message: message });

            });

        }


    }


    interface WMChatElement extends HTMLElement{
        messages: ChatUIMessage[];
    }

    ///Data structure used in the wm-chat element
    interface ChatUIMessage {
        user: string;
        message: string;
    }



}


