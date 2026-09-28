/* =========================================================
   SELF LEARNING AI CHATBOT
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   BASIC ELEMENTS
========================================================= */

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const questionInput = document.getElementById("question");
const newChatBtn = document.getElementById("new-chat-btn");


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addMessage(
    text,
    type,
    sourceText = null,
    question = "",
    sourceType = null
) {
    const row = document.createElement("div");

    row.className = `message-row ${type}`;


    const message = document.createElement("div");

    message.className = "message";

    message.textContent = text;


    /*
        Add source information
    */

    if (sourceText) {

        const source =
            document.createElement("div");

        source.className =
            "message-source";

        source.textContent =
            sourceText;

        message.appendChild(source);
    }


    row.appendChild(message);


    /*
        Show Teach AI button ONLY
        when knowledge is unknown
    */

    if (
        type === "bot" &&
        sourceType === "unknown"
    ) {

        const teachButton =
            document.createElement("button");

        teachButton.className =
            "teach-from-chat";

        teachButton.textContent =
            "🧠 Teach AI";


        teachButton.addEventListener(
            "click",
            function () {

                openTeachFromChat(
                    question
                );
            }
        );


        row.appendChild(
            teachButton
        );
    }


    chatBox.appendChild(row);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


/* =========================================================
   OPEN TEACH AI FROM UNKNOWN QUESTION
========================================================= */

function openTeachFromChat(question) {

    teachModal.classList.add(
        "active"
    );


    /*
        Automatically put the
        unknown question in the
        Teach AI question field.
    */

    teachQuestion.value =
        question;


    /*
        Keep answer empty because
        AI doesn't know the answer.
    */

    teachAnswer.value =
        "";


    teachStatus.textContent =
        "";

    teachStatus.className =
        "teach-status";


    teachQuestion.focus();
}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTyping() {

    const row =
        document.createElement("div");

    row.className =
        "message-row bot";

    row.id =
        "typing-message";


    row.innerHTML = `
        <div class="message">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;


    chatBox.appendChild(row);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing-message"
        );


    if (typing) {
        typing.remove();
    }
}

/* =========================================================
   PART 2 — SEND CHAT MESSAGE
========================================================= */

async function sendMessage(question) {

    question = question.trim();

    if (!question) {
        return;
    }

    /* Show user message */

    addMessage(
        question,
        "user"
    );

    /* Clear input */

    questionInput.value = "";

    /* Show typing */

    showTyping();


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "CHAT RESPONSE:",
            data
        );


        removeTyping();


        /*
            Use similarity to decide whether
            the answer is learned knowledge.

            0.70 or higher = known
            Below 0.70 = unknown
        */

        const similarity =
            Number(data.similarity);


        let sourceText = null;

        let sourceType = null;


        /* ==============================
           LEARNED KNOWLEDGE
        ============================== */

        if (
            !isNaN(similarity) &&
            similarity >= 0.70
        ) {

            sourceText =
                `🧠 Learned knowledge • Similarity: ${similarity}`;

            sourceType =
                "semantic_search";
        }


        /* ==============================
           UNKNOWN
        ============================== */

        else {

            sourceText =
                "📚 Knowledge not found";

            sourceType =
                "unknown";
        }


        /*
            Add bot response
        */

        addMessage(
            data.answer,
            "bot",
            sourceText,
            question,
            sourceType
        );


    } catch (error) {

        removeTyping();


        addMessage(
            "Sorry, I couldn't connect to the AI server. Please make sure FastAPI is running.",
            "bot",
            "⚠️ Connection error"
        );


        console.error(
            "Chat error:",
            error
        );
    }
}


/* =========================================================
   CHAT FORM
========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        function (event) {

            /*
                VERY IMPORTANT:
                Prevent the HTML form from
                reloading the page.
            */

            event.preventDefault();


            sendMessage(
                questionInput.value
            );
        }
    );
}


/* =========================================================
   ENTER KEY
========================================================= */

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                chatForm.requestSubmit();
            }
        }
    );
}

/* =========================================================
   SUGGESTION BUTTONS
========================================================= */

function connectSuggestionButtons() {

    const buttons =
        document.querySelectorAll(
            ".suggestion"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    questionInput.value =
                        button.textContent.trim();

                    questionInput.focus();
                }
            );
        }
    );
}


/*
    Connect the suggestion buttons
    already present when the page loads.
*/

connectSuggestionButtons();


/* =========================================================
   NEW CHAT
========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            /*
                Reset chat area
            */

            chatBox.innerHTML = `
                <div class="welcome">

                    <div class="welcome-icon">
                        ✦
                    </div>

                    <h2>
                        Hello! I'm your AI assistant.
                    </h2>

                    <p>
                        I learn from the knowledge
                        you teach me.
                        Ask me something and let's
                        start a conversation.
                    </p>

                    <div class="suggestions">

                        <button class="suggestion">
                            What is Python?
                        </button>

                        <button class="suggestion">
                            What is FastAPI?
                        </button>

                        <button class="suggestion">
                            Explain AI
                        </button>

                    </div>

                </div>
            `;


            /*
                Clear input
            */

            questionInput.value = "";


            /*
                Focus input
            */

            questionInput.focus();


            /*
                The suggestion buttons were
                recreated, so connect them again.
            */

            connectSuggestionButtons();
        }
    );
}
/* =========================================================
   TEACH AI MODAL
========================================================= */

const teachModal =
    document.getElementById(
        "teach-modal"
    );

const teachBtn =
    document.getElementById(
        "learn-btn"
    );

const closeTeachModal =
    document.getElementById(
        "close-teach-modal"
    );

const cancelTeach =
    document.getElementById(
        "cancel-teach"
    );

const teachForm =
    document.getElementById(
        "teach-form"
    );

const teachQuestion =
    document.getElementById(
        "teach-question"
    );

const teachAnswer =
    document.getElementById(
        "teach-answer"
    );

const teachStatus =
    document.getElementById(
        "teach-status"
    );


/* =========================================================
   OPEN TEACH MODAL
========================================================= */

function openTeachModal() {

    teachModal.classList.add(
        "active"
    );

    teachQuestion.focus();
}


/* =========================================================
   CLOSE TEACH MODAL
========================================================= */

function closeTeachModalWindow() {

    teachModal.classList.remove(
        "active"
    );


    teachForm.reset();


    teachStatus.textContent =
        "";

    teachStatus.className =
        "teach-status";
}


/* =========================================================
   TEACH BUTTON
========================================================= */

if (teachBtn) {

    teachBtn.addEventListener(
        "click",
        openTeachModal
    );
}


/* =========================================================
   CLOSE BUTTONS
========================================================= */

if (closeTeachModal) {

    closeTeachModal.addEventListener(
        "click",
        closeTeachModalWindow
    );
}


if (cancelTeach) {

    cancelTeach.addEventListener(
        "click",
        closeTeachModalWindow
    );
}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE MODAL
========================================================= */

if (teachModal) {

    teachModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                teachModal
            ) {

                closeTeachModalWindow();
            }
        }
    );
}


/* =========================================================
   TEACH AI / LEARN API
========================================================= */

if (teachForm) {

    teachForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const question =
                teachQuestion.value.trim();

            const answer =
                teachAnswer.value.trim();


            /*
                Validate input
            */

            if (
                !question ||
                !answer
            ) {

                teachStatus.textContent =
                    "Please enter both a question and an answer.";

                teachStatus.className =
                    "teach-status error";

                return;
            }


            /*
                Show loading message
            */

            teachStatus.textContent =
                "🧠 Teaching AI...";

            teachStatus.className =
                "teach-status";


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/learn",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                question:
                                    question,

                                answer:
                                    answer
                            })
                        }
                    );


                const data =
                    await response.json();


                /*
                    Duplicate question
                */

                if (
                    response.status ===
                    409
                ) {

                    teachStatus.textContent =
                        "⚠️ " +
                        (
                            data.detail ||
                            "A similar question already exists."
                        );

                    teachStatus.className =
                        "teach-status error";

                    return;
                }


                /*
                    Other server error
                */

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to teach AI."
                    );
                }


                /*
                    Successful learning
                */

                teachStatus.textContent =
                    "✓ AI learned this knowledge successfully!";

                teachStatus.className =
                    "teach-status success";


                /*
                    Close modal after
                    successful learning
                */

                setTimeout(
                    function () {

                        closeTeachModalWindow();

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Teach AI error:",
                    error
                );


                teachStatus.textContent =
                    "Unable to connect to the AI server.";

                teachStatus.className =
                    "teach-status error";
            }
        }
    );
}
/* =========================================================
   KNOWLEDGE LIBRARY
========================================================= */

const knowledgeModal =
    document.getElementById(
        "knowledge-modal"
    );

const closeKnowledgeModal =
    document.getElementById(
        "close-knowledge-modal"
    );

const knowledgeList =
    document.getElementById(
        "knowledge-list"
    );

const knowledgeCount =
    document.getElementById(
        "knowledge-count"
    );

const knowledgeSearch =
    document.getElementById(
        "knowledge-search"
    );


/*
    Store all knowledge here so
    searching doesn't require a
    new API request every time.
*/

let allKnowledge = [];


/* =========================================================
   FIND KNOWLEDGE BUTTON
========================================================= */

const knowledgeButtons =
    document.querySelectorAll(
        ".side-action"
    );


/*
    Your sidebar currently has:

    0 = New Chat
    1 = Teach AI
    2 = Knowledge
    ...

    We don't want to depend on
    that position.

    First try to find a button
    containing "Knowledge".
*/

let knowledgeBtn = null;


knowledgeButtons.forEach(
    function (button) {

        if (
            button.textContent
                .toLowerCase()
                .includes("knowledge")
        ) {

            knowledgeBtn = button;
        }
    }
);


/* =========================================================
   OPEN KNOWLEDGE LIBRARY
========================================================= */

if (knowledgeBtn) {

    knowledgeBtn.addEventListener(
        "click",
        function () {

            knowledgeModal.classList.add(
                "active"
            );

            loadKnowledge();
        }
    );
}


/* =========================================================
   CLOSE KNOWLEDGE LIBRARY
========================================================= */

if (closeKnowledgeModal) {

    closeKnowledgeModal.addEventListener(
        "click",
        function () {

            knowledgeModal.classList.remove(
                "active"
            );
        }
    );
}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================= */

if (knowledgeModal) {

    knowledgeModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                knowledgeModal
            ) {

                knowledgeModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   LOAD KNOWLEDGE FROM FASTAPI
========================================================= */

async function loadKnowledge() {

    /*
        Show loading state
    */

    knowledgeList.innerHTML = `
        <div class="knowledge-loading">
            Loading knowledge...
        </div>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/knowledge"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load knowledge."
            );
        }


        /*
            Get JSON data
        */

        allKnowledge =
            await response.json();


        /*
            Update count
        */

        if (knowledgeCount) {

            knowledgeCount.textContent =
                allKnowledge.length;
        }


        /*
            Display knowledge
        */

        renderKnowledge(
            allKnowledge
        );


    } catch (error) {

        console.error(
            "Knowledge loading error:",
            error
        );


        knowledgeList.innerHTML = `
            <div class="knowledge-error">
                Unable to load knowledge.
            </div>
        `;
    }
}


/* =========================================================
   DISPLAY KNOWLEDGE
========================================================= */

function renderKnowledge(list) {

    /*
        No knowledge
    */

    if (
        !list ||
        list.length === 0
    ) {

        knowledgeList.innerHTML = `
            <div class="knowledge-empty">
                🧠 No knowledge has been learned yet.
            </div>
        `;

        return;
    }


    /*
        Clear old content
    */

    knowledgeList.innerHTML = "";


    /*
        Create each knowledge card
    */

    list.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "knowledge-card";


            /* -----------------------------------------
               QUESTION
            ----------------------------------------- */

            const question =
                document.createElement(
                    "div"
                );

            question.className =
                "knowledge-question";

            question.textContent =
                "Q: " + item.question;


            /* -----------------------------------------
               ANSWER
            ----------------------------------------- */

            const answer =
                document.createElement(
                    "div"
                );

            answer.className =
                "knowledge-answer";

            answer.textContent =
                item.answer;


            /* -----------------------------------------
               CREATED DATE
            ----------------------------------------- */

            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "knowledge-date";


            if (item.created_at) {

                date.textContent =
                    new Date(
                        item.created_at
                    ).toLocaleString();

            } else {

                date.textContent =
                    "Recently learned";
            }


            /* -----------------------------------------
               EDIT BUTTON
            ----------------------------------------- */

            const editButton =
                document.createElement(
                    "button"
                );

            editButton.className =
                "edit-knowledge";

            editButton.textContent =
                "✏️ Edit";


            editButton.addEventListener(
                "click",
                function () {

                    editKnowledge(
                        item
                    );
                }
            );


            /* -----------------------------------------
               DELETE BUTTON
            ----------------------------------------- */

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "delete-knowledge";

            deleteButton.textContent =
                "🗑️ Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteKnowledge(
                        item.id
                    );
                }
            );


            /* -----------------------------------------
               ADD ELEMENTS TO CARD
            ----------------------------------------- */

            card.appendChild(
                question
            );

            card.appendChild(
                answer
            );

            card.appendChild(
                date
            );

            card.appendChild(
                editButton
            );

            card.appendChild(
                deleteButton
            );


            /*
                Add card to library
            */

            knowledgeList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   SEARCH KNOWLEDGE
========================================================= */

if (knowledgeSearch) {

    knowledgeSearch.addEventListener(
        "input",
        function () {

            const searchText =
                knowledgeSearch.value
                    .trim()
                    .toLowerCase();


            /*
                If search is empty,
                show everything.
            */

            if (!searchText) {

                renderKnowledge(
                    allKnowledge
                );

                return;
            }


            /*
                Search both question
                and answer.
            */

            const filtered =
                allKnowledge.filter(
                    function (item) {

                        const question =
                            item.question
                                .toLowerCase();

                        const answer =
                            item.answer
                                .toLowerCase();


                        return (
                            question.includes(
                                searchText
                            )

                            ||

                            answer.includes(
                                searchText
                            )
                        );
                    }
                );


            /*
                Display search results
            */

            renderKnowledge(
                filtered
            );
        }
    );
}
/* =========================================================
   DELETE KNOWLEDGE
========================================================= */

async function deleteKnowledge(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this knowledge?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `http://127.0.0.1:8000/knowledge/${id}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to delete knowledge."
            );
        }


        /*
            Reload knowledge library
        */

        await loadKnowledge();


    } catch (error) {

        console.error(
            "Delete knowledge error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete this knowledge."
        );
    }
}


/* =========================================================
   EDIT KNOWLEDGE
========================================================= */

function editKnowledge(item) {

    openEditModal(item);
}


/* =========================================================
   EDIT MODAL ELEMENTS
========================================================= */

const editModal =
    document.getElementById(
        "edit-modal"
    );

const closeEditModal =
    document.getElementById(
        "close-edit-modal"
    );

const cancelEdit =
    document.getElementById(
        "cancel-edit"
    );

const editForm =
    document.getElementById(
        "edit-form"
    );

const editQuestion =
    document.getElementById(
        "edit-question"
    );

const editAnswer =
    document.getElementById(
        "edit-answer"
    );

const editStatus =
    document.getElementById(
        "edit-status"
    );


/*
    Keep track of which knowledge
    item is being edited.
*/

let editingKnowledgeId = null;


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal(item) {

    editingKnowledgeId =
        item.id;


    /*
        Put existing data into
        the edit form.
    */

    editQuestion.value =
        item.question;

    editAnswer.value =
        item.answer;


    /*
        Clear previous status
    */

    editStatus.textContent =
        "";

    editStatus.className =
        "teach-status";


    /*
        Open modal
    */

    editModal.classList.add(
        "active"
    );


    editQuestion.focus();
}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModalWindow() {

    editModal.classList.remove(
        "active"
    );


    editingKnowledgeId =
        null;


    editForm.reset();


    editStatus.textContent =
        "";

    editStatus.className =
        "teach-status";
}


/* =========================================================
   CLOSE EDIT BUTTON
========================================================= */

if (closeEditModal) {

    closeEditModal.addEventListener(
        "click",
        closeEditModalWindow
    );
}


/* =========================================================
   CANCEL EDIT
========================================================= */

if (cancelEdit) {

    cancelEdit.addEventListener(
        "click",
        closeEditModalWindow
    );
}


/* =========================================================
   CLICK OUTSIDE EDIT MODAL
========================================================= */

if (editModal) {

    editModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                editModal
            ) {

                closeEditModalWindow();
            }
        }
    );
}


/* =========================================================
   UPDATE KNOWLEDGE
========================================================= */

if (editForm) {

    editForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const question =
                editQuestion.value.trim();

            const answer =
                editAnswer.value.trim();


            /*
                Validate fields
            */

            if (
                !question ||
                !answer
            ) {

                editStatus.textContent =
                    "Please fill in both fields.";

                editStatus.className =
                    "teach-status error";

                return;
            }


            /*
                Make sure an item
                is actually selected.
            */

            if (
                editingKnowledgeId === null
            ) {

                editStatus.textContent =
                    "No knowledge item selected.";

                editStatus.className =
                    "teach-status error";

                return;
            }


            /*
                Loading state
            */

            editStatus.textContent =
                "✏️ Saving changes...";

            editStatus.className =
                "teach-status";


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/knowledge/${editingKnowledgeId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                question:
                                    question,

                                answer:
                                    answer
                            })
                        }
                    );


                const data =
                    await response.json();


                /*
                    Backend error
                */

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to update knowledge."
                    );
                }


                /*
                    Successful update
                */

                editStatus.textContent =
                    "✓ Knowledge updated successfully!";

                editStatus.className =
                    "teach-status success";


                /*
                    Close modal and
                    reload library.
                */

                setTimeout(
                    async function () {

                        closeEditModalWindow();

                        await loadKnowledge();

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Edit knowledge error:",
                    error
                );


                editStatus.textContent =
                    error.message ||
                    "Unable to update knowledge.";

                editStatus.className =
                    "teach-status error";
            }
        }
    );
}
/* =========================================================
   CHAT HISTORY
========================================================= */

const historyModal =
    document.getElementById(
        "history-modal"
    );

const historyBtn =
    document.getElementById(
        "history-btn"
    );

const closeHistoryModal =
    document.getElementById(
        "close-history-modal"
    );

const historyList =
    document.getElementById(
        "history-list"
    );


/* =========================================================
   OPEN CHAT HISTORY
========================================================= */

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        function () {

            historyModal.classList.add(
                "active"
            );

            loadHistory();
        }
    );
}


/* =========================================================
   CLOSE CHAT HISTORY
========================================================= */

if (closeHistoryModal) {

    closeHistoryModal.addEventListener(
        "click",
        function () {

            historyModal.classList.remove(
                "active"
            );
        }
    );
}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================= */

if (historyModal) {

    historyModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                historyModal
            ) {

                historyModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   LOAD CHAT HISTORY
========================================================= */

async function loadHistory() {

    /*
        Loading state
    */

    historyList.innerHTML = `
        <div class="knowledge-loading">
            Loading history...
        </div>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/history"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load chat history."
            );
        }


        const history =
            await response.json();


        renderHistory(
            history
        );


    } catch (error) {

        console.error(
            "History loading error:",
            error
        );


        historyList.innerHTML = `
            <div class="knowledge-error">
                Unable to load chat history.
            </div>
        `;
    }
}


/* =========================================================
   DISPLAY CHAT HISTORY
========================================================= */

function renderHistory(history) {

    /*
        No history
    */

    if (
        !history ||
        history.length === 0
    ) {

        historyList.innerHTML = `
            <div class="knowledge-empty">
                💬 No conversations yet.
            </div>
        `;

        return;
    }


    /*
        Clear old history
    */

    historyList.innerHTML = "";


    /*
        Create each history card
    */

    history.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "knowledge-card";


            /* -----------------------------------------
               QUESTION
            ----------------------------------------- */

            const question =
                document.createElement(
                    "div"
                );

            question.className =
                "knowledge-question";

            question.textContent =
                "Q: " + item.question;


            /*
                Clicking the question
                puts it back into chat input.
            */

            question.style.cursor =
                "pointer";


            question.addEventListener(
                "click",
                function () {

                    historyModal.classList.remove(
                        "active"
                    );


                    questionInput.value =
                        item.question;


                    questionInput.focus();
                }
            );


            /* -----------------------------------------
               ANSWER
            ----------------------------------------- */

            const answer =
                document.createElement(
                    "div"
                );

            answer.className =
                "knowledge-answer";

            answer.textContent =
                item.answer;


            /* -----------------------------------------
               DATE
            ----------------------------------------- */

            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "knowledge-date";


            if (item.created_at) {

                date.textContent =
                    new Date(
                        item.created_at
                    ).toLocaleString();

            } else {

                date.textContent =
                    "Recently";
            }


            /* -----------------------------------------
               DELETE BUTTON
            ----------------------------------------- */

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "delete-knowledge";

            deleteButton.textContent =
                "🗑️ Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteHistory(
                        item.id
                    );
                }
            );


            /* -----------------------------------------
               ADD TO CARD
            ----------------------------------------- */

            card.appendChild(
                question
            );

            card.appendChild(
                answer
            );

            card.appendChild(
                date
            );

            card.appendChild(
                deleteButton
            );


            /*
                Add card to history list
            */

            historyList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   DELETE ONE HISTORY ITEM
========================================================= */

async function deleteHistory(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://127.0.0.1:8000/history/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to delete conversation."
            );
        }


        /*
            Refresh history
        */

        await loadHistory();


    } catch (error) {

        console.error(
            "Delete history error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete conversation."
        );
    }
}


/* =========================================================
   CLEAR ALL CHAT HISTORY
========================================================= */

const clearHistoryBtn =
    document.getElementById(
        "clear-history-btn"
    );


if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Are you sure you want to clear all chat history?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/history",
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to clear history."
                    );
                }


                /*
                    Refresh history
                */

                await loadHistory();


            } catch (error) {

                console.error(
                    "Clear history error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to clear chat history."
                );
            }
        }
    );
}
/* =========================================================
   FINAL INITIALIZATION
========================================================= */


/*
    Make sure the page starts at
    the bottom of the chat area.
*/

if (chatBox) {

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


/*
    Keep the question input ready.
*/

if (questionInput) {

    questionInput.focus();
}


/*
    Debug message.

    If you see this in the browser
    console, the complete script.js
    loaded successfully.
*/

console.log(
    "✅ Self Learning AI Chatbot frontend loaded successfully."
);